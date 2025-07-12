import { TranslationTreeKey } from "@/types/translation";
import { create } from "zustand";

type FilenameState = {
  fileNameState: string;
  change: (newName: string) => void;
  reset: () => void;
};

export const useFileNameStore = create<FilenameState>((set) => ({
  fileNameState: "common",
  change: (newName: string) => set(() => ({ fileNameState: newName })),
  reset: () => set({ fileNameState: "common" }),
}));

type KeyState = {
  fullKeyPath: string;
  updateFullKeyPathState: (newPath: string) => void;
  DBkeys: TranslationTreeKey[];
  setDBKeys: (keys: TranslationTreeKey[]) => void;
  reset: () => void;
};

export const useKeyStore = create<KeyState>((set) => ({
  fullKeyPath: "",
  DBkeys: [],
  updateFullKeyPathState: (newName: string) =>
    set(() => ({ fullKeyPath: newName })),
  setDBKeys: (keys: TranslationTreeKey[]) => set(() => ({ DBkeys: keys })),
  reset: () => set({ fullKeyPath: "" }),
}));
