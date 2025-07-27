import {
  FileState,
  KeyState,
  LanguageType,
  TranslationTreeKey,
} from "@/types/translation";
import { create } from "zustand";
import { useTreeKeyStore } from "./useTreeKeyStore";

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
  updateKeyPathSegmentInFiles: (
    oldFullKeyPath: string,
    newSegment: string
  ) => void;
  reset: () => void;
};

export const useAllKeyFileStore = create<AllFileState>((set, get) => ({
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
  removeKeyFromFilesInfo: (key) => {
    set((state) => {
      const updatedFiles = state.filesInfo.map((file) => {
        const updatedKeys = file.keys.filter(
          (e) => e.full_key_path !== key.full_key_path
        ); // use full_key_path, instead of id, to remove all keys of same full_key_path
        return {
          ...file,
          keys: updatedKeys,
          isDirty: updatedKeys.some((e) => e.isChanged),
        };
      });

      return { filesInfo: updatedFiles };
    });
    localStorage.setItem("translationEdits", JSON.stringify(get().filesInfo));
  },
  updateKeyChanged: (editedKey: KeyState) => {
    set((state) => ({
      filesInfo: state.filesInfo.map((file) => {
        const updatedKeys = file.keys.map((key) => {
          if (key.id === editedKey.id) {
            if (key.value === editedKey.value) {
              return { ...key, isChanged: false };
            }
            return { ...editedKey };
          }
          return key;
        });

        // Check if any key is changed to set isDirty
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
  updateKeyPathSegmentInFiles: (oldFullKeyPath, newSegment) => {
    const setSelectedTreeKey = useTreeKeyStore.getState().setSelectedTreeKey;
    set((state) => {
      const updatedFiles = state.filesInfo.map((file) => {
        let fileChanged = false;

        const updatedKeys = file.keys.map((key) => {
          if (key.full_key_path === oldFullKeyPath) {
            const segments = oldFullKeyPath.split(".");
            segments[segments.length - 1] = newSegment;
            const newFullKeyPath = segments.join(".");

            console.log("Updating newFullKeyPath:", newFullKeyPath);

            fileChanged = true;

            //update full_key_path of selectedTreeKey
            setSelectedTreeKey({
              ...key,
              full_key_path: newFullKeyPath,
              key_path_segment: newSegment,
            });

            return {
              ...key,
              key_path_segment: newSegment,
              full_key_path: newFullKeyPath,
              isChanged: true,
            };
          }
          return key;
        });

        return {
          ...file,
          keys: updatedKeys,
          isDirty: fileChanged || updatedKeys.some((k) => k.isChanged),
        };
      });

      localStorage.setItem("translationEdits", JSON.stringify(updatedFiles));
      return { filesInfo: updatedFiles };
    });
  },

  reset: () =>
    set(() => ({
      filesInfo: [],
    })),
}));
