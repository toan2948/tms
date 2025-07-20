import { create } from "zustand";

type FilenameState = {
  fileNameState: string;
  setFileName: (newName: string) => void;
  reset: () => void;
};

export const useFileNameStore = create<FilenameState>((set) => ({
  fileNameState: "common",
  setFileName: (newName: string) => set(() => ({ fileNameState: newName })),
  reset: () => set({ fileNameState: "common" }),
}));
