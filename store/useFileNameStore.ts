import { TranslationTreeKey } from "@/types/translation";
import { create } from "zustand";

type FilenameState = {
  fileNameState: string;
  changeFileName: (newName: string) => void;
  reset: () => void;
};

export const useFileNameStore = create<FilenameState>((set) => ({
  fileNameState: "common",
  changeFileName: (newName: string) => set(() => ({ fileNameState: newName })),
  reset: () => set({ fileNameState: "common" }),
}));

type KeyState = {
  fullKeyPathState: string;
  updateFullKeyPathState: (newPath: string) => void;
  DBkeys: {
    fileName: string;
    keys: TranslationTreeKey[];
  }[];
  setDBKeys: (keys: TranslationTreeKey[], file_name: string) => void;
  addKeyToTree: (key: TranslationTreeKey, file_name: string) => void;
  removeKeyFromTree: (keyId: string, file_name: string) => void;
  reset: () => void;
};

export const useKeyStore = create<KeyState>((set, get) => ({
  fullKeyPathState: "",
  DBkeys: [],

  updateFullKeyPathState: (newName: string) =>
    set(() => ({ fullKeyPathState: newName })),
  setDBKeys: (keys: TranslationTreeKey[], file_name: string) => {
    const DBkeys = get().DBkeys;
    const checkFileName = DBkeys.find(
      (e: { fileName: string; keys: TranslationTreeKey[] }) =>
        e.fileName === file_name
    );
    if (!checkFileName) {
      set(() => ({
        DBkeys: [...DBkeys, { fileName: file_name, keys }],
      }));
    }
  },

  addKeyToTree: (key, file_name) => {
    const DBkeys = get().DBkeys;
    const fileIndex = DBkeys.findIndex((e) => e.fileName === file_name);

    if (fileIndex !== -1) {
      const updatedKeys = [...DBkeys[fileIndex].keys, key];
      const updatedFile = { ...DBkeys[fileIndex], keys: updatedKeys };
      const newDBkeys = [...DBkeys];
      newDBkeys[fileIndex] = updatedFile;
      set(() => ({ DBkeys: newDBkeys }));
    } else {
      console.error(`File with name ${file_name} not found in DBkeys.`);
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

  //  set(() => ({ DBkeys: keys }))},
  reset: () => set({ fullKeyPathState: "" }),
}));
