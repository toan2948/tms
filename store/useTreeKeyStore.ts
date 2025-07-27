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
  addKeysToTree: (
    key: TranslationTreeKey[],
    file_name: string,
    language_code: string
  ) => void;
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
  addKeysToTree: (newKeys, fileName, language_code) => {
    if (language_code !== "en") return;
    // Only add keys if the language is English
    const DBkeys = get().DBkeys;
    const fileIndex = DBkeys.findIndex((e) => e.fileName === fileName);

    if (fileIndex !== -1) {
      const existingKeys = DBkeys[fileIndex].keys;
      const updatedKeys = [...existingKeys, ...newKeys];

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

    if (fileIndex !== -1) {
      const updatedKeys = DBkeys[fileIndex].keys.filter(
        (key) => key.id !== keyId
      );
      const updatedFile = { ...DBkeys[fileIndex], keys: updatedKeys };
      const newDBkeys = [...DBkeys];
      newDBkeys[fileIndex] = updatedFile;
      set(() => ({ DBkeys: newDBkeys }));
      localStorage.setItem("DBkeys", JSON.stringify(newDBkeys));
    } else {
      console.error(`File with name ${file_name} not found in DBkeys.`);
    }
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

    if (!targetKey) {
      console.error(`Key with ID "${keyId}" not found in file "${fileName}".`);
      return false;
    }
    // Update the key's segment
    const updatedKey = { ...targetKey, key_path_segment: newSegment };

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
