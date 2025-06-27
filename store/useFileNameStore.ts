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
  changeFullKeyPath: (newPath: string) => void;
  reset: () => void;
};

export const useKeyStore = create<KeyState>((set) => ({
  fullKeyPath: "",
  changeFullKeyPath: (newName: string) => set(() => ({ fullKeyPath: newName })),
  reset: () => set({ fullKeyPath: "" }),
}));
