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
  fullKeyPath: string;
  updateFullKeyPathState: (newPath: string) => void;
  DBkeys: {
    fileName: string;
    keys: TranslationTreeKey[];
  }[];
  setDBKeys: (keys: TranslationTreeKey[], file_name: string) => void;
  reset: () => void;
};

export const useKeyStore = create<KeyState>((set, get) => ({
  fullKeyPath: "",
  DBkeys: [],
  updateFullKeyPathState: (newName: string) =>
    set(() => ({ fullKeyPath: newName })),
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
  //  set(() => ({ DBkeys: keys }))},
  reset: () => set({ fullKeyPath: "" }),
}));
