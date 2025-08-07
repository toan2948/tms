import { create } from "zustand";

type FilenameState = {
  seeAllChanges: boolean;
  setSeeAllChanges: (value: boolean) => void;
  // reset: () => void;
};

export const useOtherStateStore = create<FilenameState>((set) => ({
  seeAllChanges: false,
  setSeeAllChanges: (value) => set(() => ({ seeAllChanges: value })),
  // reset: () => set({ seeAllChanges:  }),
}));
