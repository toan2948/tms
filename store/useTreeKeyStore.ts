import { TranslationTreeKey } from "@/types/keyType";
import { create } from "zustand";

type TreeKeyState = {
  selectedTreeKey: TranslationTreeKey | null;
  parentIDs: string[];
  setParentIDs: (ids: string[]) => void;

  setSelectedTreeKey: (key: TranslationTreeKey | null) => void;

  // setDBKeysFromOtherStore: (keys: DBkeys[]) => void;

  reset: () => void;
};

export const useTreeKeyStore = create<TreeKeyState>((set) => ({
  selectedTreeKey: null,
  parentIDs: [],
  setParentIDs: (ids: string[]) => set(() => ({ parentIDs: ids })),
  setSelectedTreeKey: (key: TranslationTreeKey | null) =>
    set(() => ({ selectedTreeKey: key })),

  // setDBKeysFromOtherStore: (newDBkeys) => {
  //   set(() => ({
  //     DBkeys: newDBkeys,
  //   }));
  //   localStorage.setItem("DBkeys", JSON.stringify(newDBkeys));
  // },

  reset: () => set({ selectedTreeKey: null, parentIDs: [] }),
}));
