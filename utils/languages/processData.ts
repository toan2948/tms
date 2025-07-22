// lib/translations/group.ts

import {
  FileState,
  KeyState,
  TranslationTreeKey,
  TranslationValue,
  TranslationValueWithOld,
} from "@/types/translation";

function findKeyById(files: FileState[], keyId: string): string | null {
  for (const file of files) {
    const found = file.keys.find((key) => key.id === keyId);
    if (found) return found.value !== null ? found.value : null;
  }
  return null;
}

export function getEnglishKeyVersion(
  fullKeyPath: string,
  files: FileState[]
): number {
  const englishFiles = files.filter(
    (file) => file.language_code.toLowerCase() === "en"
  );

  for (const file of englishFiles) {
    const key = file.keys.find((k) => k.fullKeyPath === fullKeyPath);
    if (key) {
      return key.version;
    }
  }

  return 1;
}

export const filterTranslationKeys = (
  localStorageFilesInfo: FileState[],
  DBFilesInfo: FileState[]
): TranslationValueWithOld[] => {
  // 1st Step: filter out the changed keys from localStorageFilesInfo and updated version temporarily
  const changedKeys = localStorageFilesInfo.flatMap((file) =>
    file.keys
      .filter((key) => key.isChanged || key.isNew)
      .map((key) => {
        // Find the corresponding key in the localStorageDBValues
        const old_value = findKeyById(DBFilesInfo, key.id);

        return {
          id: key.id,
          value: key.value,
          old_value: old_value,
          fullKeyPath: key.fullKeyPath,
          language_code: file.language_code,
          language_name: file.language_name,
          filename: file.fileName,
          version: !key.value ? 0 : key.version + 1, // Increment version for local changes
          last_edited_at: key.last_edited_at,
          has_children: key.has_children,
          parent_id: key.parent_id,
          notes: key.notes || null,
          isNew: key.isNew, // Indicates if the key is newly added
        };
      })
  );

  //2nd Step: check if english translation is also updated

  const returnedKeys = changedKeys.map((key) => {
    // Find the corresponding key in the localStorageDBValues
    const englishVersion = getEnglishKeyVersion(key.fullKeyPath, DBFilesInfo);

    const isUpdatedEnglishKey = changedKeys.find(
      (e) => e.fullKeyPath === key.fullKeyPath && e.language_code === "en"
    )?.version;
    // console.log("isEnglishKeyAlsoUpdated", isUpdatedEnglishKey, englishVersion);
    return {
      id: key.id,
      value: key.value,
      old_value: key.old_value,
      fullKeyPath: key.fullKeyPath,
      language_code: key.language_code,
      language_name: key.language_name,
      filename: key.filename,
      version: !key.value
        ? 0
        : key.isNew
          ? 1
          : isUpdatedEnglishKey
            ? isUpdatedEnglishKey
            : englishVersion, // Use the updated version if English key is also changed

      //todo: case of english and other languages are updated at the same time
      last_edited_at: key.last_edited_at,
      has_children: key.has_children,
      parent_id: key.parent_id,
      notes: key.notes || null,
      isNew: key.isNew, // Indicates if the key is newly added
    };
  });

  return returnedKeys;
};
const colorPalette = [
  "#2196f3",
  "#4caf50",
  "#ff9800",
  "#9c27b0",
  "#00bcd4",
  "#e91e63",
  "#795548",
  "#607d8b",
  "#ffc107",
];

export const formatSessionDialogData = (changedKeys: TranslationValue[]) => {
  // 2. Group language codes by "filename: fullKeyPath"

  const editedKeys = changedKeys.filter((e) => !e.isNew);

  // console.log("editedKeys", editedKeys);
  const groupedMap = new Map<
    string,
    { filename: string; fullKeyPath: string; languages: Set<string> }
  >();

  editedKeys.forEach((item) => {
    const groupKey = `${item.filename}: ${item.fullKeyPath}`;
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        filename: item.filename,
        fullKeyPath: item.fullKeyPath,
        languages: new Set(),
      });
    }
    groupedMap.get(groupKey)!.languages.add(item.language_code);
  });

  // 3. Assign a color per filename
  const filenameToColor = new Map<string, string>();

  let colorIndex = 0;
  for (const { filename } of groupedMap.values()) {
    if (!filenameToColor.has(filename)) {
      filenameToColor.set(
        filename,
        colorPalette[colorIndex % colorPalette.length]
      );
      colorIndex++;
    }
  }

  // 4. Build final array
  type ColoredChangedKey = {
    label: string;
    color: string;
    filename: string;
    fullKeyPath: string;
  };

  const changedKeyStrings: ColoredChangedKey[] = Array.from(
    groupedMap.entries()
  ).map(([key, { filename, languages, fullKeyPath }]) => ({
    label: `${key} -- ${Array.from(languages).join(", ")}`,
    color: filenameToColor.get(filename)!,
    filename: filename,
    fullKeyPath: fullKeyPath,
  }));
  return changedKeyStrings;
};

function moveEnglishToTopImmutable(
  values: TranslationValue[]
): TranslationValue[] {
  const english = values.find((v) => v.language_code === "en");
  const others = values.filter((v) => v.language_code !== "en");
  return english ? [english, ...others] : values;
}
export const getTranslationKeys = (
  fileN: string,
  path: string,
  files: FileState[],
  selectedKey: string | null = null
): TranslationValue[] => {
  if (!selectedKey) return [];
  const searchedFiles = files.filter((e) => e.fileName === fileN);
  if (searchedFiles.length === 0) return [];
  const result: TranslationValue[] = [];
  searchedFiles.forEach((element) => {
    const foundKeys = element.keys.filter((key) => key.fullKeyPath === path);
    if (foundKeys.length > 0) {
      result.push({
        id: foundKeys[0].id,
        value: foundKeys[0].value,
        fullKeyPath: foundKeys[0].fullKeyPath,
        language_code: element.language_code,
        language_name: element.language_name,
        filename: element.fileName,
        version: foundKeys[0].version,
        last_edited_at: foundKeys[0].last_edited_at,
        has_children: foundKeys[0].has_children,
        parent_id: foundKeys[0].parent_id,
        notes: foundKeys[0].notes || null,
        isNew: foundKeys[0].isNew,
      });
    }
  });

  const sortedResult = moveEnglishToTopImmutable(result);
  return sortedResult;
};

export function buildKeyTreeFromFlatList(
  keys: TranslationTreeKey[]
): TranslationTreeKey[] {
  const keyMap = new Map<string, TranslationTreeKey>();
  const tree: TranslationTreeKey[] = [];

  // First, add all keys to a map for quick access
  keys.forEach((key) => {
    key.children = [];
    keyMap.set(key.id, key);
  });

  // Then, build the tree by linking parents and children
  keys.forEach((key) => {
    if (key.parent_id) {
      const parent = keyMap.get(key.parent_id);
      if (parent) {
        parent.children?.push(key);
      }
    } else {
      // No parent_id → top-level node
      tree.push(key);
    }
  });

  return tree;
}

export function findKeyStateByIdAcrossFiles(
  fileStates: FileState[],
  keyId: string
): KeyState | undefined {
  for (const file of fileStates) {
    const key = file.keys.find((k) => k.id === keyId);
    if (key) {
      return key;
    }
  }
  return undefined;
}
export type GroupedTranslationValues = {
  filename: string;
  fullKeyPath: string;
  list: TranslationValueWithOld[];
  color: string; // color for the filename
};

export const groupTranslationValues = (
  keys: TranslationValueWithOld[]
): GroupedTranslationValues[] => {
  const groupedMap = new Map<string, GroupedTranslationValues>();

  const editedKeys = keys.filter((e) => !e.isNew);
  editedKeys.forEach((item) => {
    const key = `${item.filename}:::${item.fullKeyPath}`; // unique composite key

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        filename: item.filename,
        fullKeyPath: item.fullKeyPath,
        list: [item],
        color: "", // to be assigned later
      });
    } else {
      groupedMap.get(key)!.list.push(item);
    }
  });

  const groups = Array.from(groupedMap.values());
  const filenameColorMap = new Map<string, string>();
  let colorIndex = 0;

  for (const group of groups) {
    const filename = group.filename;
    if (!filenameColorMap.has(filename)) {
      const color = colorPalette[colorIndex % colorPalette.length];
      filenameColorMap.set(filename, color);
      colorIndex++;
    }
  }

  // Attach color to each group based on its filename
  return groups.map((group) => ({
    ...group,
    color: filenameColorMap.get(group.filename)!,
  }));
};

export function findParentIdsToRootByFullKeyPath(
  fullKeyPath: string,
  files: FileState[],
  language_code = "en", // default to English,
  fileName: string
): string[] {
  // Find the file for the language_code (English default)
  const file = files.find(
    (f) => f.language_code === language_code && f.fileName === fileName
  );
  if (!file) return [];

  // Map id -> KeyState for fast parent lookup
  const map = new Map<string, KeyState>(file.keys.map((k) => [k.id, k]));

  // Find the key by fullKeyPath
  const key = file.keys.find((k) => k.fullKeyPath === fullKeyPath);
  if (!key) return [];
  const targetID = key.id;

  const parentIds: string[] = [targetID];
  let current = key;

  // Traverse up parents by id
  while (current.parent_id) {
    parentIds.push(current.parent_id);
    current = map.get(current.parent_id)!;
    if (!current) break; // safety check in case of missing parent
  }

  return parentIds; // root → closest parent
}

export const findSelectedKey = (
  ID: string,
  filename: string,
  keyList: {
    fileName: string;
    keys: TranslationTreeKey[];
  }[]
): TranslationTreeKey | null => {
  const keysOfCurrentFile = keyList.find((e) => e.fileName === filename)?.keys;
  if (!keysOfCurrentFile) {
    console.warn("No keys found for the current file:", filename);
    return null;
  }
  const currentSelectedKey = keysOfCurrentFile.find((k) => k.id === ID);

  return currentSelectedKey || null;
};
