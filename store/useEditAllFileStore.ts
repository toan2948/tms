import {
  FileState,
  KeyState,
  LanguageType,
  TranslationTreeKey,
} from "@/types/translation";
import { create } from "zustand";

type AllFileState = {
  //these states are to handle the error: localStorage is not defined (in case only localStorage is used)
  filesInfo: FileState<KeyState>[];
  languages: LanguageType[];
  setLanguages: (languages: LanguageType[]) => void;
  addKeysToFilesInfo: (
    key: KeyState[],
    fileName: string,
    language_code: string
  ) => void;
  removeKeyFromFilesInfo: (key: TranslationTreeKey) => void;
  setFilesInfo: (files: FileState<KeyState>[]) => void;
  updateKeyChanged: (editedKey: KeyState) => void;
  reset: () => void;
};

export const useEditAllFileStore = create<AllFileState>((set, get) => ({
  filesInfo: [],
  languages: [],
  setLanguages: (languages) =>
    set(() => ({
      languages,
    })),
  setFilesInfo: (files: FileState<KeyState>[]) =>
    set(() => ({
      filesInfo: files,
    })),

  addKeysToFilesInfo: (
    newKeys: KeyState[],
    fileName: string,
    language_code: string
  ) => {
    set((state) => {
      //filter keys by language_code
      const newKeysOfLanguageCode = newKeys.filter(
        (e) => e.language_code === language_code
      );
      const updatedFiles = state.filesInfo.map((file) => {
        if (
          file.fileName === fileName &&
          file.language_code === language_code
        ) {
          const updatedKeys = [...file.keys, ...newKeysOfLanguageCode];
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
  removeKeyFromFilesInfo: (key) =>
    set((state) => {
      const updatedFiles = state.filesInfo.map((file) => {
        const updatedKeys = file.keys.filter((e) => e.id !== key.id);
        return {
          ...file,
          keys: updatedKeys,
          isDirty: updatedKeys.some((e) => e.isChanged),
        };
      });

      localStorage.setItem("translationEdits", JSON.stringify(updatedFiles));
      return { filesInfo: updatedFiles };
    }),
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
