import {
  DBkeys,
  FileState,
  KeyState,
  LanguageType,
  TranslationTreeKey,
} from "@/types/keyType";
import { setTreeKeys } from "@/utils/languages/processData";
import { create } from "zustand";
import { useTreeKeyStore } from "./useTreeKeyStore";

type AllFileState = {
  //these states are to handle the error: localStorage is not defined (in case only localStorage is used)
  filesInfo: FileState<KeyState>[];
  languages: LanguageType[];
  DBkeys: DBkeys[];

  setLanguages: (languages: LanguageType[]) => void;
  addKeysToFilesInfo: (
    key: KeyState[],
    fileName: string,
    language_code: string
  ) => void;
  removeKeyFromFilesInfo: (key: TranslationTreeKey, fileName: string) => void;
  setFilesInfo: (files: FileState<KeyState>[]) => void;
  setDBKeys: (files: FileState<KeyState>[]) => void;

  updateKeyChanged: (editedKey: KeyState) => void;
  updateKeyPathSegmentInFiles: (
    oldFullKeyPath: string,
    newSegment: string,
    fileName: string
  ) => void;
  updateKeyNoteInFilesInfo: (
    fullPath: string,
    note: string | null,
    fileName: string
  ) => void;
  reset: () => void;
};

export const useAllKeyFileStore = create<AllFileState>((set, get) => ({
  filesInfo: [],
  DBkeys: [],

  languages: [],
  setLanguages: (languages) =>
    set(() => ({
      languages,
    })),
  setFilesInfo: (files: FileState<KeyState>[]) => {
    set(() => ({
      filesInfo: files,
    }));
    localStorage.setItem("translationEdits", JSON.stringify(files));
    const setDBKeys = get().setDBKeys;
    setDBKeys(files);
  },
  setDBKeys: (files) => {
    const newTreeKeys = setTreeKeys(files);

    set(() => ({
      DBkeys: newTreeKeys,
    }));
    localStorage.setItem("DBkeys", JSON.stringify(newTreeKeys));
  },

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
      const setDBKeys = get().setDBKeys;
      setDBKeys(updatedFiles);
      return { filesInfo: updatedFiles };
    });
  },
  removeKeyFromFilesInfo: (treeKey: TranslationTreeKey, fileName: string) => {
    set((state) => {
      const { filesInfo } = state;

      // All files for the same file name (across all languages)
      const filesOfTargetFile = filesInfo.filter(
        (file) => file.fileName === fileName
      );

      // Flatten all keys of that file across languages
      const allKeys = filesOfTargetFile.flatMap((file) => file.keys);

      // Get all keys that match the target full_key_path
      const initialKeysToRemove = allKeys.filter(
        (k) => k.full_key_path === treeKey.full_key_path
      );

      if (initialKeysToRemove.length === 0) {
        console.warn(
          `No keys found with full_key_path "${treeKey.full_key_path}" in file "${fileName}".`
        );
        return { filesInfo };
      }

      // Collect descendant keys (by parent_id) for all matching keys

      const collectDescendantsByParentId = (
        startIds: string[],
        all: KeyState[]
      ) => {
        const toRemove = new Set(startIds);
        const queue = [...startIds];

        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const children = all.filter((k) => k.parent_id === currentId);
          for (const child of children) {
            if (!toRemove.has(child.id)) {
              toRemove.add(child.id);
              queue.push(child.id);
            }
          }
        }

        return toRemove;
      };

      // Enhanced: collect isNew parents only if they have no remaining children
      const collectIsNewParents = (
        startKeys: KeyState[],
        all: KeyState[],
        alreadyMarkedForRemoval: Set<string>
      ) => {
        const toRemove = new Set<string>();

        for (const key of startKeys) {
          let current = key;

          while (current.parent_id) {
            const parent = all.find((k) => k.id === current.parent_id);
            if (!parent || parent.isNew !== true) break;

            const otherChildren = all.filter(
              (k) =>
                k.parent_id === parent.id &&
                k.id !== current.id &&
                !alreadyMarkedForRemoval.has(k.id)
            );

            if (otherChildren.length === 0) {
              toRemove.add(parent.id);
              current = parent;
            } else {
              break;
            }
          }
        }

        return toRemove;
      };

      const initialIds = initialKeysToRemove.map((k) => k.id);
      const descendantIds = collectDescendantsByParentId(initialIds, allKeys);

      const parentIds = initialKeysToRemove.some((k) => k.isNew === true)
        ? collectIsNewParents(initialKeysToRemove, allKeys, descendantIds)
        : new Set<string>();

      const idsToRemove = new Set([...descendantIds, ...parentIds]);

      // Remove from all language versions of the file
      const updatedFiles = filesInfo.map((file) => {
        if (file.fileName !== fileName) return file;

        const updatedKeys = file.keys.filter((k) => !idsToRemove.has(k.id));

        return {
          ...file,
          keys: updatedKeys,
          isDirty: updatedKeys.some((k) => k.isChanged),
        };
      });

      localStorage.setItem("translationEdits", JSON.stringify(updatedFiles));

      const setDBKeys = get().setDBKeys;
      setDBKeys(updatedFiles);

      return { filesInfo: updatedFiles };
    });
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
  updateKeyPathSegmentInFiles: (oldFullKeyPath, newSegment, fileName) => {
    const setSelectedTreeKey = useTreeKeyStore.getState().setSelectedTreeKey;

    set((state) => {
      const updatedFiles = state.filesInfo.map((file) => {
        if (file.fileName !== fileName) return file;

        let fileChanged = false;
        const idMap = new Map<string, string>(); // Maps old full path to new

        // Step 1: Find the target key (by full_key_path)
        const targetKey = file.keys.find(
          (key) => key.full_key_path === oldFullKeyPath
        );
        if (!targetKey) return file;

        // Step 2: Rename the segment
        const segments = oldFullKeyPath.split(".");
        const oldSegmentIndex = segments.indexOf(targetKey.key_path_segment);

        if (oldSegmentIndex === -1) {
          console.warn(
            `Segment "${targetKey.key_path_segment}" not found in "${oldFullKeyPath}".`
          );
          return file;
        }

        segments[oldSegmentIndex] = newSegment;
        const newFullKeyPath = segments.join(".");
        setSelectedTreeKey({
          ...targetKey,
          key_path_segment: newSegment,
          full_key_path: newFullKeyPath,
        });

        idMap.set(targetKey.id, newFullKeyPath); // mark the update

        const updatedKeys: KeyState[] = [];

        const updateDescendants = (
          parentId: string,
          parentFullPath: string
        ) => {
          for (const child of file.keys) {
            if (child.parent_id === parentId) {
              const newChildFullPath =
                parentFullPath + "." + child.key_path_segment;
              idMap.set(child.id, newChildFullPath);
              updateDescendants(child.id, newChildFullPath);
            }
          }
        };

        updateDescendants(targetKey.id, newFullKeyPath);

        for (const key of file.keys) {
          if (key.id === targetKey.id) {
            fileChanged = true;
            const updated = {
              ...key,
              key_path_segment: newSegment,
              full_key_path: newFullKeyPath,
              isChanged: newSegment === key.old_segment ? false : true, //isChanged is false if the key name is changed back to the old before submitting to DB
            };
            updatedKeys.push(updated);

            // Also update selectedTreeKey if relevant
          } else if (idMap.has(key.id)) {
            fileChanged = true;
            updatedKeys.push({
              ...key,
              full_key_path: idMap.get(key.id)!,
              isChanged:
                idMap.get(key.id)! === key.old_full_key_path ? false : true, //isChanged is false if the key name is changed back to the old before submitting to DB
            });
          } else {
            updatedKeys.push(key);
          }
        }

        return {
          ...file,
          keys: updatedKeys,
          isDirty: fileChanged || updatedKeys.some((k) => k.isChanged),
        };
      });

      localStorage.setItem("translationEdits", JSON.stringify(updatedFiles));
      const setDBKeys = get().setDBKeys;
      setDBKeys(updatedFiles);
      return { filesInfo: updatedFiles };
    });
  },
  updateKeyNoteInFilesInfo: (fullPath, note, fileName) => {
    set((state) => {
      const updatedFiles = state.filesInfo.map((file) => {
        if (file.fileName !== fileName) return file;

        const updatedKeys = file.keys.map((key) => {
          if (key.full_key_path === fullPath) {
            return {
              ...key,
              notes: note,
            };
          }
          return key;
        });

        return {
          ...file,
          keys: updatedKeys,
        };
      });

      localStorage.setItem("translationEdits", JSON.stringify(updatedFiles));
      const setDBKeys = get().setDBKeys;
      setDBKeys(updatedFiles);
      return { filesInfo: updatedFiles };
    });
  },
  reset: () =>
    set(() => ({
      filesInfo: [],
    })),
}));
