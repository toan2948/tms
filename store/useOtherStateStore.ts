import { create } from "zustand";

type FilenameState = {
  fileNameState: string;
  setFileName: (newName: string) => void;
  seeAllChanges: boolean;
  setSeeAllChanges: () => void;
  reset: () => void;
};

export const useOtherStateStore = create<FilenameState>((set) => ({
  fileNameState: "common",
  seeAllChanges: false,
  setSeeAllChanges: () =>
    set((state) => ({ seeAllChanges: !state.seeAllChanges })),
  setFileName: (newName: string) => set(() => ({ fileNameState: newName })),
  reset: () => set({ fileNameState: "common" }),
}));
