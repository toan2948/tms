import { create } from "zustand";
export type NestedObject = {
  [key: string]: string | NestedObject;
};
export const useTreeDataStore = create((set) => ({
  treeData: [],
  setTreeData: (newTreeData: NestedObject[]) => set({ treeData: newTreeData }),
}));
