import { FileState, KeyState } from "@/types/translation";
import { create } from "zustand";

type AllFileState = {
  filesInfo: FileState[];
  initialSet: (files: FileState[]) => void;
  updateKeyChanged: (editedKey: KeyState) => void;
  reset: () => void;
};

export const useEditAllFileStore = create<AllFileState>((set, get) => ({
  filesInfo: [],
  initialSet: (files: FileState[]) =>
    set(() => ({
      filesInfo: files,
    })),
  updateKeyChanged: (editedKey: KeyState) => {
    set((state) => ({
      filesInfo: state.filesInfo.map((file) => {
        const updatedKeys = file.keys.map((key) =>
          key.id === editedKey.id ? { ...key, ...editedKey } : key
        );
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
