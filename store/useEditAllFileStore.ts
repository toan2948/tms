import { FileState, KeyState } from "@/types/translation";
import { create } from "zustand";

type AllFileState = {
  //these states are to handle the error: localStorage is not defined (in case only localStorage is used)
  filesInfo: FileState[];
  DBFilesInfo: FileState[];
  addKeysToFilesInfo: (key: KeyState[], fileName: string) => void;
  setFilesInfo: (files: FileState[]) => void;
  updateKeyChanged: (editedKey: KeyState) => void;
  setDBFilesInfo: (files: FileState[]) => void;
  reset: () => void;
};

export const useEditAllFileStore = create<AllFileState>((set, get) => ({
  filesInfo: [],
  DBFilesInfo: [],
  setFilesInfo: (files: FileState[]) =>
    set(() => ({
      filesInfo: files,
    })),
  setDBFilesInfo: (files: FileState[]) =>
    set(() => ({
      DBFilesInfo: files,
    })),
  addKeysToFilesInfo: (newKeys: KeyState[], fileName: string) => {
    set((state) => {
      const updatedFiles = state.filesInfo.map((file) => {
        if (file.fileName === fileName) {
          const updatedKeys = [...file.keys, ...newKeys];
          return {
            ...file,
            keys: updatedKeys,
            isDirty: true,
          };
        }
        return file;
      });

      localStorage.setItem("translationEdits", JSON.stringify(updatedFiles));
      return { filesInfo: updatedFiles };
    });
  },

  updateKeyChanged: (editedKey: KeyState) => {
    set((state) => ({
      filesInfo: state.filesInfo.map((file) => {
        const updatedKeys = file.keys.map((key) => {
          if (key.value === editedKey.value) {
            return { ...key, isChanged: false };
          } else
            return key.id === editedKey.id ? { ...key, ...editedKey } : key;
        });
        const isDirty = updatedKeys.some((key) => key.isChanged);
        return {
          ...file,
          isDirty,
          keys: updatedKeys,
        };
      }),
    }));
    const updatedFiles = get().filesInfo;
    localStorage.setItem("translationEdits", JSON.stringify(updatedFiles));
  },

  reset: () =>
    set(() => ({
      filesInfo: [],
    })),
}));
