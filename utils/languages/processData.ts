// lib/translations/group.ts

import { FileState, KeyState, TranslationTreeKey } from "@/types/keyType";

export function getEnglishKeyVersion(
  fullKey: string,
  files: FileState<KeyState>[]
): number {
  const englishFiles = files.filter(
    (file) => file.language_code.toLowerCase() === "en"
  );

  for (const file of englishFiles) {
    const key = file.keys.find((k) => k.full_key_path === fullKey);
    if (key) {
      return key.old_version || 0;
    }
  }

  return 1;
}

const sortKeysInFieldList = (result: KeyState[]) => {
  // Custom sorting logic
  result.sort((a, b) => {
    const priority = (code: string): number => {
      if (code === "en") return 0;
      if (code === "cn") return 1;
      return 2;
    };

    const prioA = priority(a.language_code);
    const prioB = priority(b.language_code);

    if (prioA !== prioB) {
      return prioA - prioB;
    }

    return a.language_name.localeCompare(b.language_name);
  });
  return result;
};

export const filterChangedKeys = (
  localStorageFilesInfo: FileState<KeyState>[]
): KeyState[] => {
  // 1st Step: filter out the changed keys from localStorageFilesInfo and updated version temporarily
  const changedKeys = localStorageFilesInfo.flatMap((file) =>
    file.keys
      .filter((key) => key.isChanged || key.isNew)
      .map((key) => {
        // Find the corresponding key in the localStorageDBValues

        return {
          id: key.id,
          value: key.value,
          old_value: key.old_value || null, // Ensure old_value is always present
          full_key_path: key.full_key_path,
          language_code: file.language_code,
          language_name: file.language_name,
          fileName: file.fileName,
          isChanged: key.isChanged, // Indicates if the key has been changed
          version: !key.value ? 0 : key.version + 1, // Increment version for local changes
          last_edited_at: key.last_edited_at,
          has_children: key.has_children,
          parent_id: key.parent_id,
          notes: key.notes || null,

          key_path_segment: key.key_path_segment,
          old_segment: key.old_segment,
          old_full_key_path: key.old_full_key_path,
          level: key.level,
          file_id: key.file_id, // Include file_id for reference
          old_version: key.old_version, // Ensure old_version is always present
          isNew: key.isNew, // Indicates if the key is newly added
        };
      })
  );

  //2nd Step: check if english translation is also updated

  const returnedKeys = changedKeys.map((key) => {
    // Find the corresponding key in the localStorageDBValues
    const englishVersion = getEnglishKeyVersion(
      key.full_key_path,
      localStorageFilesInfo
    );

    const isUpdatedEnglishKey = changedKeys.find(
      (e) => e.full_key_path === key.full_key_path && e.language_code === "en"
    )?.version;
    return {
      id: key.id,
      value: key.value,
      old_value: key.old_value,
      full_key_path: key.full_key_path,
      language_code: key.language_code,
      language_name: key.language_name,
      fileName: key.fileName,
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
      key_path_segment: key.key_path_segment,
      old_segment: key.old_segment,
      old_full_key_path: key.old_full_key_path,
      level: key.level,
      file_id: key.file_id,
      isChanged: key.isChanged, // Indicates if the key has been changed

      old_version: key.old_version, // Ensure old_version is always present
      isNew: key.isNew, // Indicates if the key is newly added
    };
  });

  return sortKeysInFieldList(returnedKeys);
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

export type ColoredChangedKey = {
  label: string;
  color: string;
  fileName: string;
  full_key_path: string;
  isKeyNameChanged: boolean;
  oldFullKey: string;
};
export const formatSessionDialogData = (
  keys: KeyState[],
  filterFn: (item: KeyState) => boolean
) => {
  //  Group language codes by "filename: fullKey"

  const editedKeys = keys.filter(filterFn);

  const groupedMap = new Map<
    string,
    {
      filename: string;
      fullKey: string;
      isKeyNameChanged: boolean;
      oldFullKey: string;
      languages: Set<string>;
    }
  >();

  editedKeys.forEach((item) => {
    const groupKey = `${item.fileName}: ${item.full_key_path}`;
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        filename: item.fileName ? item.fileName : "Unknown File",
        fullKey: item.full_key_path,
        isKeyNameChanged: item.full_key_path !== item.old_full_key_path,
        oldFullKey: item.old_full_key_path || "",
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

  const changedKeyStrings: ColoredChangedKey[] = Array.from(
    groupedMap.entries()
  ).map(
    ([
      key,
      {
        filename,
        languages,
        fullKey: fullKeyPath,
        isKeyNameChanged,
        oldFullKey,
      },
    ]) => ({
      label: `${key} -- ${Array.from(languages).join(", ")}`,
      color: filenameToColor.get(filename)!,
      fileName: filename,
      isKeyNameChanged,
      oldFullKey,
      full_key_path: fullKeyPath,
    })
  );
  return changedKeyStrings;
};

export const getTranslationKeys = (
  fileN: string,
  selectedKey: KeyState | null,
  files: FileState<KeyState>[]
): KeyState[] => {
  if (!selectedKey) return [];
  const searchedFiles = files.filter((e) => e.fileName === fileN);
  if (searchedFiles.length === 0) return [];
  const result: KeyState[] = [];
  searchedFiles.forEach((element) => {
    const foundKeys = element.keys.filter(
      (key) => key.full_key_path === selectedKey.full_key_path
    );
    if (foundKeys.length > 0) {
      result.push({
        id: foundKeys[0].id,
        value: foundKeys[0].value,
        full_key_path: foundKeys[0].full_key_path,
        language_code: element.language_code,
        language_name: element.language_name,
        fileName: element.fileName,
        version: foundKeys[0].version,
        last_edited_at: foundKeys[0].last_edited_at,
        has_children: foundKeys[0].has_children,
        parent_id: foundKeys[0].parent_id,
        notes: foundKeys[0].notes || null,
        isNew: foundKeys[0].isNew,
        key_path_segment: foundKeys[0].key_path_segment,
        old_segment: foundKeys[0].old_segment || null,
        old_full_key_path: foundKeys[0].old_full_key_path || null,
        level: foundKeys[0].level,
        isChanged: foundKeys[0].isChanged,
        file_id: foundKeys[0].file_id, // Include file_id for reference
        old_version: foundKeys[0].old_version, // Ensure old_version is always present
        old_value: foundKeys[0].old_value || null, // Ensure old_value is always present
      });
    }
  });

  return sortKeysInFieldList(result);
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

  //sort the nodes in the tree
  const customSort = (a: TranslationTreeKey, b: TranslationTreeKey) => {
    const aNum = Number(a.key_path_segment);
    const bNum = Number(b.key_path_segment);
    const aIsNum = !isNaN(aNum);
    const bIsNum = !isNaN(bNum);

    if (aIsNum && bIsNum) return aNum - bNum; // number vs number
    if (aIsNum) return -1; // number before string
    if (bIsNum) return 1; // number before string
    return a.key_path_segment.localeCompare(b.key_path_segment, undefined, {
      sensitivity: "base",
    }); // string vs string
  };

  // Recursive sort
  const sortNodes = (nodes: TranslationTreeKey[]) => {
    nodes.sort(customSort);
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(tree);

  return tree;
}

export function findKeyStateByIdAcrossFiles(
  fileStates: FileState<KeyState>[],
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
  fullKey: string;
  isKeyNameChanged: boolean; // old full key path
  oldFullKey: string;
  list: KeyState[];
  color: string; // color for the filename
  pathSegment: string;
  old_pathSegment: string; // old path segment
};

export const groupTranslationValues = (
  keys: KeyState[],
  filterFn: (item: KeyState) => boolean
): GroupedTranslationValues[] => {
  const groupedMap = new Map<string, GroupedTranslationValues>();

  const filteredKeys = keys.filter(filterFn);
  filteredKeys.forEach((item) => {
    const key = `${item.fileName}:::${item.full_key_path}`; // unique composite key

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        filename: item.fileName ? item.fileName : "Unknown File",
        fullKey: item.full_key_path,
        isKeyNameChanged:
          item.full_key_path !== item.old_full_key_path && !item.isNew, //by a new key, the old name will not be shown
        oldFullKey: item.old_full_key_path || "",
        list: [item],
        color: "", // to be assigned later
        pathSegment: item.key_path_segment,
        old_pathSegment: item.old_segment || "", // old path segment
      });
    } else {
      groupedMap.get(key)!.list.push(item);
    }
  });

  const groups = Array.from(groupedMap.values());
  // console.log("Grouped Translation Values:", groups);
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
  fullKey: string,
  files: FileState<KeyState>[],
  fileName: string
): string[] {
  // Find the file for the language_code (English default)
  const file = files.find(
    (f) => f.language_code === "en" && f.fileName === fileName
  );
  if (!file) {
    console.warn("No matching file found.");
    return [];
  }
  // Map id -> KeyState for fast parent lookup
  const map = new Map<string, KeyState>(file.keys.map((k) => [k.id, k]));

  // Find the key by fullKey
  const key = file.keys.find((k) => k.full_key_path === fullKey);
  if (!key) {
    console.warn("Key not found:", fullKey);
    return [];
  }
  const targetID = key.id;

  const parentIds: string[] = [targetID];
  let current = key;

  // Traverse up parents by id
  while (current.parent_id) {
    const next = map.get(current.parent_id);
    if (!next) {
      console.warn(
        `⛔ Missing parent in map for parent_id: ${current.parent_id}`
      );
      break;
    }
    parentIds.push(current.parent_id);
    current = map.get(current.parent_id)!;
    if (!current) break; // safety check in case of missing parent
  }

  return parentIds; // root → closest parent
}

export const findEnglishFiles = (files: FileState<KeyState>[]) => {
  return files.filter((e) => e.language_code.toLowerCase() === "en");
};

export const findSelectedKey = (
  ID: string,
  filename: string,
  keyList: FileState<KeyState>[]
): KeyState | null => {
  //consider english file only
  const englishFiles = findEnglishFiles(keyList);
  const keysOfCurrentFile = englishFiles.find(
    (e) => e.fileName === filename
  )?.keys;
  if (!keysOfCurrentFile) {
    console.warn("No keys found for the current file:", filename);
    return null;
  }
  const currentSelectedKey = keysOfCurrentFile.find((k) => k.id === ID);

  return currentSelectedKey || null;
};

export function normalizeEmpty(value: string | null | undefined): string {
  return value ?? "";
}
export const checkDuplicateKeyName = (
  newName: string,
  old_key: KeyState,
  files: FileState<KeyState>[],
  fileNameState: string
) => {
  const { parent_id, level } = old_key;
  const englishFiles = findEnglishFiles(files);
  const a = englishFiles.find((e) => e.fileName === fileNameState)?.keys || [];
  const siblingExists = a.some(
    (k) =>
      k.id !== old_key.id &&
      k.parent_id === parent_id &&
      k.level === level &&
      k.key_path_segment === newName
  );
  if (siblingExists) return true;
  return false;
};

type GroupFullPath = {
  full_key_path: string;
  keys: KeyState[];
};

export function groupKeysByFullPath(keys: KeyState[]): GroupFullPath[] {
  const groupedMap = keys.reduce((map, key) => {
    const path = key.full_key_path;
    if (!map.has(path)) {
      map.set(path, []);
    }
    map.get(path)!.push(key);
    return map;
  }, new Map<string, KeyState[]>());

  return Array.from(groupedMap.entries())
    .map(([full_key_path, keys]) => ({ full_key_path, keys }))
    .sort((a, b) => a.full_key_path.localeCompare(b.full_key_path));
}

function getRandomColor(existingColors: Set<string>): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  do {
    color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  } while (existingColors.has(color));
  return color;
}

export function formatEmptyNewKeysForSessionDialog(
  groups: GroupFullPath[]
): { full_key_path: string; color: string; fileName: string; label: string }[] {
  const usedColors = new Set<string>();

  return groups.map((group) => {
    const color = getRandomColor(usedColors);
    usedColors.add(color);
    return {
      label: `${group.keys[0]?.fileName}: ${group.full_key_path}`,
      full_key_path: group.full_key_path,
      color,
      fileName: group.keys[0]?.fileName || "Unknown File",
    };
  });
}
