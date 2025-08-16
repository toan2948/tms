import { KeyState, WithFile, WithLanguage } from "@/types/keyType";
import { createClient } from "../supabase/client";

//UNUSED Function
export async function fetchTranslationKeysByFilenameAndLanguage(
  filename: string,
  languageCode: string
): Promise<KeyState[]> {
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
      "id, file_id, value, version, parent_id, key_path_segment, full_key_path, level, has_children, notes"
    )
    .eq("file_id", file.id)
    .order("level", { ascending: true });

  if (keyError) {
    throw new Error(`Error fetching keys: ${keyError.message}`);
  }

  //add language_code and language_name to each key //to overcome the typescript
  const keysWithLanguage = keys.map((key) => ({
    ...key,
    isChanged: false, // default false for now
    version: key.version || 0, // Ensure version is always defined
    old_value: key.value || null, // Assuming old_value is the same as value at the beginning
    language_code: "en", // Assuming English as default
    language_name: "English", // Assuming English as default
    old_full_key_path: key.full_key_path, // Assuming this is the same as full_key_path at the beginning
    old_segment: key.key_path_segment, // Assuming this is the same as key_path_segment at the beginning
  }));

  return keysWithLanguage ?? [];
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
      "file_id, level, key_path_segment,full_key_path, value, id, version, last_edited_at, has_children, parent_id, notes"
    )
    .in("file_id", fileIds);

  if (keysError) {
    throw new Error(`Failed to fetch keys: ${keysError.message}`);
  }

  // Group keys by file_id
  const keysByFileId = keys.reduce<Record<string, Array<KeyState>>>(
    (acc, k) => {
      if (!acc[k.file_id]) acc[k.file_id] = [];
      acc[k.file_id].push({
        full_key_path: k.full_key_path,
        old_full_key_path: k.full_key_path, //it is the same as full_key_path at the beginning
        value: k.value,
        id: k.id,
        file_id: k.file_id,
        fileName: files.find((f) => f.id === k.file_id)?.filename || "",
        version: k.version,
        last_edited_at: k.last_edited_at,
        isChanged: false, // default false for now
        has_children: k.has_children,
        parent_id: k.parent_id,
        notes: k.notes || null,
        key_path_segment: k.key_path_segment,
        old_segment: k.key_path_segment, // Assuming this is the same as key_path_segment
        level: k.level,
        language_code:
          files.find((f) => f.id === k.file_id)?.language_code || "",
        language_name:
          files.find((f) => f.id === k.file_id)?.language_name || "",
        old_value: k.value || null,
        old_version: k.version || 0,
      });
      return acc;
    },
    {}
  );

  // Build final structure
  const result = files.map((f) => ({
    file_id: f.id,
    fileName: f.filename,
    language_code: f.language_code,
    language_name: f.language_name,
    isDirty: false, // always false for fresh fetch
    keys: keysByFileId[f.id] || [],
  }));

  return result;
}

export async function updateChangedKeys(values: KeyState[]) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Batch update each row one-by-one (async parallel)
  const promises = values.map(
    ({ id, value, version, full_key_path, key_path_segment }) =>
      supabase
        .from("translation_keys")
        .update({
          value,
          last_edited_at: now,
          version: version,
          full_key_path,
          key_path_segment,
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

/**
 * Deletes all keys with the given full_key_path and their descendants across all translation files with the same filename.
 * @param fullKeyPath The full dotted key path (e.g. 'home.movie.title')
 * @param fileName The shared filename (e.g. 'common.json')
 */
export async function deleteKeyByFullPathAndFileName(
  fullKeyPath: string,
  fileName: string
) {
  const supabase = await createClient();

  // 1. Get all file_ids that match the given filename
  const { data: files, error: fileError } = await supabase
    .from("translation_files")
    .select("id")
    .eq("filename", fileName);

  if (fileError || !files?.length) {
    console.error("Error finding translation files:", fileError);
    throw new Error("No translation files found for the given filename.");
  }

  const fileIds = files.map((f) => f.id);

  // 2. Find root keys with the given full_key_path in those files
  const { data: rootKeys, error: rootError } = await supabase
    .from("translation_keys")
    .select("id")
    .in("file_id", fileIds)
    .eq("full_key_path", fullKeyPath);

  if (rootError) {
    console.error("Error finding root keys:", rootError);
    throw rootError;
  }

  const allToDelete = new Set<string>();
  const queue = [...(rootKeys ?? [])].map((k) => k.id);

  for (const id of queue) allToDelete.add(id);

  // 3. Recursively collect all descendants for each root key
  while (queue.length > 0) {
    const currentId = queue.shift()!;

    const { data: children, error: childError } = await supabase
      .from("translation_keys")
      .select("id")
      .eq("parent_id", currentId);

    if (childError) {
      console.error("Error fetching children:", childError);
      throw childError;
    }

    for (const child of children ?? []) {
      if (!allToDelete.has(child.id)) {
        allToDelete.add(child.id);
        queue.push(child.id);
      }
    }
  }

  // 4. Delete all collected keys
  const idsToDelete = Array.from(allToDelete);

  if (idsToDelete.length === 0) {
    console.warn("No keys found to delete.");
    return { deletedCount: 0 };
  }

  const { error: deleteError } = await supabase
    .from("translation_keys")
    .delete()
    .in("id", idsToDelete);

  if (deleteError) {
    console.error("Error deleting keys:", deleteError);
    throw deleteError;
  }

  return { deletedCount: idsToDelete.length };
}

export async function fetchLanguages(): Promise<WithLanguage[]> {
  const supabase = await createClient();

  //just look for keys of files in english

  const { data: language, error: langError } = await supabase
    .from("languages")
    .select(
      `
      language_id:id,
      language_code:code,
      language_name:name
    `
    )
    .order("code", { ascending: true });
  if (langError || !language) {
    throw new Error(`No Language not found: ${langError?.message}`);
  }
  return language;
}

export async function fetchFiles(): Promise<WithFile[]> {
  const supabase = await createClient();

  //just look for keys of files in english

  const { data: files, error: langError } = await supabase
    .from("translation_files")
    .select(
      `
      language_id,
      fileName:filename,
      file_id:id
    `
    )
    .order("filename", { ascending: true });
  if (langError || !files) {
    throw new Error(`No File not found: ${langError?.message}`);
  }
  console.log("fetchFiles files", files);
  return files;
}
