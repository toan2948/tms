import { TranslationTreeKey } from "@/types/translation";
import { create } from "zustand";

type TreeKeyState = {
  selectedTreeKey: TranslationTreeKey | null;
  parentIDs: string[];
  DBkeys: {
    fileName: string;
    keys: TranslationTreeKey[];
  }[];
  setParentIDs: (ids: string[]) => void;

  setSelectedTreeKey: (key: TranslationTreeKey | null) => void;
  setDBKeys: (keys: TranslationTreeKey[], file_name: string) => void;
  addKeysToTree: (key: TranslationTreeKey[], file_name: string) => void;
  removeKeyFromTree: (keyId: string, file_name: string) => void;
  updateKeyPathSegment: (
    keyId: string,
    newSegment: string,
    fileName: string
  ) => void;

  reset: () => void;
};

export const useTreeKeyStore = create<TreeKeyState>((set, get) => ({
  selectedTreeKey: null,
  DBkeys: [],
  parentIDs: [],
  setParentIDs: (ids: string[]) => set(() => ({ parentIDs: ids })),
  setSelectedTreeKey: (key: TranslationTreeKey | null) =>
    set(() => ({ selectedTreeKey: key })),

  setDBKeys: (keys: TranslationTreeKey[], file_name: string) => {
    const DBkeys = get().DBkeys;
    const checkFileName = DBkeys.find(
      (e: { fileName: string; keys: TranslationTreeKey[] }) =>
        e.fileName === file_name
    );
    if (!checkFileName) {
      const updatedDBKeys = [...DBkeys, { fileName: file_name, keys }];
      set(() => ({
        DBkeys: updatedDBKeys,
      }));
      localStorage.setItem("DBkeys", JSON.stringify(updatedDBKeys));
    }
  },
  addKeysToTree: (newKeys, fileName) => {
    // Only add keys if the language is English
    const DBkeys = get().DBkeys;
    const fileIndex = DBkeys.findIndex((e) => e.fileName === fileName);

    //take only english keys
    const englishKeys = newKeys.filter((e) => e.language_code === "en");

    //check if the key ID is already exist
    const existingKey = DBkeys[fileIndex]?.keys.some((e) => {
      return englishKeys.some((newKey) => newKey.id === e.id);
    });

    if (existingKey) {
      console.warn("Key already exists, skipping addition.");
      return;
    }

    if (fileIndex !== -1) {
      const existingKeys = DBkeys[fileIndex].keys;
      const updatedKeys = [...existingKeys, ...englishKeys];

      const updatedFile = {
        ...DBkeys[fileIndex],
        keys: updatedKeys,
      };

      const newDBkeys = [...DBkeys];
      newDBkeys[fileIndex] = updatedFile;

      set(() => ({ DBkeys: newDBkeys }));
      localStorage.setItem("DBkeys", JSON.stringify(newDBkeys));
    } else {
      console.error(`File with name ${fileName} not found in DBkeys.`);
    }
  },

  removeKeyFromTree: (keyId: string, file_name: string) => {
    const DBkeys = get().DBkeys;
    const fileIndex = DBkeys.findIndex((e) => e.fileName === file_name);

    if (fileIndex === -1) {
      console.error(`File with name ${file_name} not found in DBkeys.`);
      return;
    }

    const allKeys = DBkeys[fileIndex].keys;

    // Find all descendants using BFS
    const idsToRemove = new Set<string>();

    // Step 1: Collect descendants (BFS)
    const queue = [keyId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      idsToRemove.add(currentId);

      const children = allKeys.filter((key) => key.parent_id === currentId);
      for (const child of children) {
        queue.push(child.id);
      }
    }

    // Step 2: Traverse upward if the key isNew === true
    let currentKey = allKeys.find((k) => k.id === keyId);
    while (currentKey && currentKey.isNew === true && currentKey.parent_id) {
      const parentKey = allKeys.find((k) => k.id === currentKey!.parent_id);
      if (parentKey?.isNew === true) {
        idsToRemove.add(parentKey.id);
        currentKey = parentKey;
      } else {
        break;
      }
    }

    // Step 3: Remove from list
    const updatedKeys = allKeys.filter((key) => !idsToRemove.has(key.id));
    const updatedFile = { ...DBkeys[fileIndex], keys: updatedKeys };
    const newDBkeys = [...DBkeys];
    newDBkeys[fileIndex] = updatedFile;

    set(() => ({ DBkeys: newDBkeys }));
    localStorage.setItem("DBkeys", JSON.stringify(newDBkeys));
  },
  updateKeyPathSegment: (keyId, newSegment, fileName) => {
    const { DBkeys } = get();
    const fileIndex = DBkeys.findIndex((f) => f.fileName === fileName);

    if (fileIndex === -1) {
      console.error(`File "${fileName}" not found in DBkeys.`);
      return false;
    }

    const file = DBkeys[fileIndex];
    const keys = file.keys;
    const targetKey = keys.find((k) => k.id === keyId);
    console.log("targetKey updateKeyPathSegment:", targetKey);

    if (!targetKey) {
      console.error(`Key with ID "${keyId}" not found in file "${fileName}".`);
      return false;
    }

    const segments = targetKey.full_key_path.split(".");
    const oldSegmentIndex = segments.indexOf(targetKey.key_path_segment);
    if (oldSegmentIndex === -1) {
      console.log(
        `Segment "${targetKey.key_path_segment}" not found in key "${targetKey.full_key_path}".`
      );
      return false;
    }
    // Update the segment in the full key path
    segments[oldSegmentIndex] = newSegment;
    const newFullKeyPath = segments.join(".");

    // Update the key's segment
    const updatedKey = {
      ...targetKey,
      key_path_segment: newSegment,
      full_key_path: newFullKeyPath,
    };

    console.log("updatedKey:", updatedKey);

    // Replace the key in the array
    const updatedKeys = keys.map((k) => (k.id === keyId ? updatedKey : k));
    // Update state
    const updatedFile = { ...file, keys: updatedKeys };
    const updatedDBkeys = [...DBkeys];
    updatedDBkeys[fileIndex] = updatedFile;

    set(() => ({ DBkeys: updatedDBkeys }));
    localStorage.setItem("DBkeys", JSON.stringify(updatedDBkeys));
    return true;
  },

  reset: () => set({ selectedTreeKey: null, parentIDs: [] }),
}));
