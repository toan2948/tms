import { create } from "zustand";

type FilenameState = {
  fileNameState: string;
  setFileName: (newName: string) => void;
  seeAllChanges: boolean;
  setSeeAllChanges: (value: boolean) => void;
  reset: () => void;
};

export const useOtherStateStore = create<FilenameState>((set) => ({
  fileNameState: "common",
  seeAllChanges: false,
  setSeeAllChanges: (value) => set(() => ({ seeAllChanges: value })),
  setFileName: (newName: string) => set(() => ({ fileNameState: newName })),
  reset: () => set({ fileNameState: "common" }),
}));
