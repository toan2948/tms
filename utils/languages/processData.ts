// lib/translations/group.ts

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
