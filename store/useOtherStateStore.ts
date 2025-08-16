import { WithFile } from "@/types/keyType";
import { create } from "zustand";

type OtherState = {
  seeAllChanges: boolean;
  files: WithFile[];
  setFiles: (files: WithFile[]) => void;
  setSeeAllChanges: (value: boolean) => void;
  // reset: () => void;
};

export const useOtherStateStore = create<OtherState>((set) => ({
  seeAllChanges: false,
  files: [],
  setFiles: (files) => set(() => ({ files })),
  setSeeAllChanges: (value) => set(() => ({ seeAllChanges: value })),
  // reset: () => set({ seeAllChanges:  }),
}));
