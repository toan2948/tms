import { TranslationTreeKey, TranslationValue } from "@/types/translation";
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

  //just look for keys of files in english

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
      "id, file_id, parent_id, key_path_segment, full_key_path, level, has_children"
    )
    .eq("file_id", file.id)
    .order("level", { ascending: true });

  if (keyError) {
    throw new Error(`Error fetching keys: ${keyError.message}`);
  }

  return keys ?? [];
}
export async function fetchAllTranslationFiles() {
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
    .select(
      "file_id, full_key_path, value, id, version, last_edited_at, has_children, parent_id"
    )
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
        version: number | null;
        last_edited_at: Date | null;
        has_children: boolean;
        parent_id: string | null;
      }>
    >
  >((acc, k) => {
    if (!acc[k.file_id]) acc[k.file_id] = [];
    acc[k.file_id].push({
      fullKeyPath: k.full_key_path,
      value: k.value,
      id: k.id,
      version: k.version,
      last_edited_at: k.last_edited_at,
      isChanged: false, // default false for now
      has_children: k.has_children,
      parent_id: k.parent_id,
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

export async function updateChangedKeys(values: TranslationValue[]) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Batch update each row one-by-one (async parallel)
  const promises = values.map(({ id, value, version }) =>
    supabase
      .from("translation_keys")
      .update({
        value,
        last_edited_at: now,
        version: version,
      })
      .eq("id", id)
  );

  // Wait for all updates
  const results = await Promise.all(promises);

  // Check for errors
  for (const result of results) {
    if (result.error) {
      console.error("Update failed:", result.error);
      throw result.error;
    }
  }

  return results.map((r) => r.data).flat();
}
