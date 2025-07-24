import { KeyState } from "@/types/translation";
import { createClient } from "../supabase/client";

export async function addKeyToAllFilesWithSameName({
  filename,
  fullKeyPath,
  value = null,
}: {
  filename: string;
  fullKeyPath: string;
  value?: string | null;
}) {
  const supabase = createClient();

  // Step 1: Fetch all files with that filename
  const { data: files, error: fileError } = await supabase
    .from("translation_files")
    .select("id")
    .eq("filename", filename);

  if (fileError) throw fileError;
  if (!files || files.length === 0) {
    throw new Error(`No files found with filename: ${filename}`);
  }

  // Parse the key path
  const keySegments = fullKeyPath.split(".");
  const keyPathSegment = keySegments[keySegments.length - 1];
  const level = keySegments.length - 1;
  const parentKey = keySegments.slice(0, -1).join(".") || null;
  const now = new Date().toISOString();

  // Step 2: Prepare inserts
  // 2. Get parent key IDs for all matching files (if applicable)
  const parentMap: Record<string, string | null> = {}; // file_id => parent_id

  if (parentKey) {
    const { data: parentKeys, error: parentError } = await supabase
      .from("translation_keys")
      .select("id, file_id")
      .eq("full_key_path", parentKey);

    if (parentError) throw parentError;

    parentKeys?.forEach((pk) => {
      parentMap[pk.file_id] = pk.id;
    });
  }
  const inserts = files.map((file) => ({
    file_id: file.id,
    parent_id: parentMap[file.id] || null,
    key_path_segment: keyPathSegment,
    full_key_path: fullKeyPath,
    level,
    value,
    added_at: now,
    version: 1,
    has_children: false,
  }));

  // Step 3: Insert all at once (safe due to unique constraint)
  const { data, error: insertError } = await supabase
    .from("translation_keys")
    .upsert(inserts, {
      onConflict: "file_id,full_key_path", // matches your table's unique constraint
    });

  if (insertError) throw insertError;

  return data;
}

export async function insertNewTranslationKeys(keys: KeyState[]) {
  const supabase = createClient();

  if (keys.length === 0) return [];

  const now = new Date().toISOString();

  const rowsToInsert = keys.map((k) => ({
    id: k.id,
    file_id: k.file_id,
    parent_id: k.parent_id,
    full_key_path: k.full_key_path,
    key_path_segment: k.key_path_segment,
    value: k.value,
    level: k.level,
    added_at: now,
    last_edited_at: now,
    version: k.version ?? 1,
    status: "missing",
    notes: k.notes ?? null,
  }));

  const { data, error } = await supabase
    .from("translation_keys")
    .upsert(rowsToInsert, {
      onConflict: "id",
    });

  if (error) {
    console.error("Error inserting keys:", error);
    throw error;
  }

  return data;
}
