import { createClient } from "../supabase/client";

export async function editNote(
  keyId: string,
  note: string,
  deleteIt?: boolean
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("translation_keys")
    .update({
      notes: !deleteIt ? note : null,
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", keyId);

  if (error) {
    console.error("Failed to update notes:", error);
    throw error;
  }

  return { success: true };
}
