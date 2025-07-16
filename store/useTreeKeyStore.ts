import { create } from "zustand";

type ControlledTreeKey = {
  focusedKey: {
    id: string;
  };
  parentIDs: string[];
  setFocusedKey: (keyId: string) => void;
  setParentIDs: (ids: string[]) => void;
  reset: () => void;
};

export const useTreeKeyStore = create<ControlledTreeKey>((set) => ({
  focusedKey: { id: "" },
  parentIDs: [],
  setFocusedKey: (keyId: string) => set(() => ({ focusedKey: { id: keyId } })),
  setParentIDs: (ids: string[]) => set(() => ({ parentIDs: ids })),
  reset: () =>
    set(() => ({
      focusedKey: { id: "" },
      parentIDs: [],
    })),
}));
