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
    } else {
      console.error(`File with name ${file_name} not found in DBkeys.`);
    }
  },

  reset: () => set({ selectedTreeKey: null, parentIDs: [] }),
}));
