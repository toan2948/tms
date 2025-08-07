import { KeyState } from "@/types/keyType";
import { create } from "zustand";

type TreeKeyState = {
  selectedTreeKey: KeyState | null;
  parentIDs: string[];
  setParentIDs: (ids: string[]) => void;

  setSelectedTreeKey: (key: KeyState | null) => void;

  reset: () => void;
};

export const useTreeKeyStore = create<TreeKeyState>((set) => ({
  selectedTreeKey: null,
  parentIDs: [],
  setParentIDs: (ids) => set(() => ({ parentIDs: ids })),
  setSelectedTreeKey: (key) => set(() => ({ selectedTreeKey: key })),

  reset: () => set({ selectedTreeKey: null, parentIDs: [] }),
}));
