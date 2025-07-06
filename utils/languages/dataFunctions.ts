import {
  FileState,
  TranslationTreeKey,
  TranslationValue,
} from "@/types/translation";
import { createClient } from "../supabase/client";

export async function TreeData() {
  const supabase = await createClient();

  const { data } = await supabase.from("EN_kv").select("*");

  return JSON.stringify(data ?? {}, null, 2);
}

export async function fetchTranslationKeysByFilenameAndLanguage(
  filename: string,
  languageCode: string
): Promise<TranslationTreeKey[]> {
  const supabase = await createClient();

  const { data: language, error: langError } = await supabase
    .from("languages")
    .select("id")
    .eq("code", languageCode)
    .single();

  if (langError || !language) {
    throw new Error(
      `Language "${languageCode}" not found: ${langError?.message}`
    );
  }

  const { data: file, error: fileError } = await supabase
    .from("translation_files")
    .select("id")
    .eq("filename", filename)
    .eq("language_id", language.id)
    .single();

  if (fileError || !file) {
    throw new Error(
      `File "${filename}" not found or query failed: ${fileError?.message}`
    );
  }

  // Now get all translation keys for that file_id
  const { data: keys, error: keyError } = await supabase
    .from("translation_keys")
    .select(
      `
      id,
      file_id,
      parent_id,
      key_path_segment,
      full_key_path,
      level
    `
    )
    .eq("file_id", file.id)
    .order("level", { ascending: true });

  if (keyError) {
    throw new Error(`Error fetching keys: ${keyError.message}`);
  }

  return keys ?? [];
}
export async function getAllTranslationFiles() {
  const supabase = await createClient();

  // Fetch files with their language info
  const { data: files, error: filesError } = await supabase.from(
    "translation_files_with_language"
  ).select(`
      id,
      filename,
      language_code,
      language_name
    `);

  if (filesError) {
    throw new Error(`Failed to fetch files: ${filesError.message}`);
  }

  // Extract file IDs
  const fileIds = files.map((f) => f.id);

  // Fetch all keys for these files
  const { data: keys, error: keysError } = await supabase
    .from("translation_keys")
    .select("file_id, full_key_path, value, id")
    .in("file_id", fileIds);

  if (keysError) {
    throw new Error(`Failed to fetch keys: ${keysError.message}`);
  }

  // Group keys by file_id
  const keysByFileId = keys.reduce<
    Record<
      string,
      Array<{
        fullKeyPath: string;
        id: string;
        value: string | null;
        isChanged: boolean;
      }>
    >
  >((acc, k) => {
    if (!acc[k.file_id]) acc[k.file_id] = [];
    acc[k.file_id].push({
      fullKeyPath: k.full_key_path,
      value: k.value,
      id: k.id,
      isChanged: false, // default false for now
    });
    return acc;
  }, {});

  // Build final structure
  const result = files.map((f) => ({
    fileName: f.filename,
    language_code: f.language_code,
    language_name: f.language_name,
    isDirty: false, // always false for fresh fetch
    keys: keysByFileId[f.id] || [],
  }));

  return result;
}

export const getTranslationKeys = (
  fileN: string,
  path: string,
  files: FileState[]
) => {
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
      });
    }
  });
  return result;
};
