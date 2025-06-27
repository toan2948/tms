export interface TranslationKey {
  id: string;
  file_id: string;
  parent_id: string | null;
  key_path_segment: string;
  value: string | null;
  full_key_path: string;
  level: number;
  added_at: string; // ISO date string
  last_edited_at: string; // ISO date string
  version: number;
  status: "done" | "error" | "missing";
  score: number | null;
  notes: string | null;
  ticket_number: string | null;
  pr_number: string | null;

  // For building UI trees
  children?: TranslationKey[];
}
export interface TranslationTreeKey {
  id: string;
  file_id: string;
  parent_id: string | null;
  key_path_segment: string;
  full_key_path: string;
  level: number;

  // For building UI trees
  children?: TranslationTreeKey[];
}
