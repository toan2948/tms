import { create } from "zustand";

type ControlledTreeKey = {
  parentIDs: string[];
  setParentIDs: (ids: string[]) => void;
  reset: () => void;
};

export const useTreeKeyStore = create<ControlledTreeKey>((set) => ({
  parentIDs: [],
  setParentIDs: (ids: string[]) => set(() => ({ parentIDs: ids })),
  reset: () =>
    set(() => ({
      parentIDs: [],
    })),
}));
