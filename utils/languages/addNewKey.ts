import { KeyState } from "@/types/translation";
import { createClient } from "../supabase/client";

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
    has_children: k.has_children,
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
