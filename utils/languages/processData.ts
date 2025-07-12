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

export const filterTranslationKeys = (
  localStorageFilesInfo: FileState[],
  DBFilesInfo: FileState[]
): TranslationValueWithOld[] => {
  const changedKeys = localStorageFilesInfo.flatMap((file) =>
    file.keys
      .filter((key) => key.isChanged)
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
          version: key.version,
          last_edited_at: key.last_edited_at,
          has_children: key.has_children,
        };
      })
  );
  return changedKeys;
};

export const formatSessionDialogData = (changedKeys: TranslationValue[]) => {
  // 2. Group language codes by "filename: fullKeyPath"
  const groupedMap = new Map<
    string,
    { filename: string; languages: Set<string> }
  >();

  changedKeys.forEach((item) => {
    const groupKey = `${item.filename}: ${item.fullKeyPath}`;
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        filename: item.filename,
        languages: new Set(),
      });
    }
    groupedMap.get(groupKey)!.languages.add(item.language_code);
  });

  // 3. Assign a color per filename
  const filenameToColor = new Map<string, string>();
  const colorPalette = [
    "#f44336",
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
  };

  const changedKeyStrings: ColoredChangedKey[] = Array.from(
    groupedMap.entries()
  ).map(([key, { filename, languages }]) => ({
    label: `${key} -- ${Array.from(languages).join(", ")}`,
    color: filenameToColor.get(filename)!,
  }));
  return changedKeyStrings;
};
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
      });
    }
  });
  return result;
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
type GroupedTranslationValues = {
  filename: string;
  fullKeyPath: string;
  list: TranslationValueWithOld[];
};

export const groupTranslationValues = (
  values: TranslationValueWithOld[]
): GroupedTranslationValues[] => {
  const groupedMap = new Map<string, GroupedTranslationValues>();

  values.forEach((item) => {
    const key = `${item.filename}:::${item.fullKeyPath}`; // unique composite key

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        filename: item.filename,
        fullKeyPath: item.fullKeyPath,
        list: [item],
      });
    } else {
      groupedMap.get(key)!.list.push(item);
    }
  });

  return Array.from(groupedMap.values());
};
