// lib/translations/group.ts

import { TranslationTreeKey } from "@/types/translation";

type RawTranslation = {
  id: string;
  full_key_path: string;
  value: string;
  translation_files: {
    id: string;
    filename: string;
    languages: {
      code: string;
    };
  };
};

export function groupTranslationsByFileAndLanguage(data: RawTranslation[]) {
  const result: Record<string, Record<string, Record<string, string>>> = {};

  for (const item of data) {
    const filename = item.translation_files?.filename;
    const langCode = item.translation_files?.languages?.code;
    const key = item.full_key_path;
    const value = item.value;

    if (!filename || !langCode) continue;

    if (!result[filename]) result[filename] = {};
    if (!result[filename][langCode]) result[filename][langCode] = {};

    result[filename][langCode][key] = value;
  }

  return result;
}

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
