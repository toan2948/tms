import { create } from "zustand";

type OtherState = {
  seeAllChanges: boolean;
  setSeeAllChanges: (value: boolean) => void;
  // reset: () => void;
};

export const useOtherStateStore = create<OtherState>((set) => ({
  seeAllChanges: false,
  setSeeAllChanges: (value) => set(() => ({ seeAllChanges: value })),
  // reset: () => set({ seeAllChanges:  }),
}));
