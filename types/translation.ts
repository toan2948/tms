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
export type KeyState = {
  fullKeyPath: string;
  id: string;
  isChanged: boolean;
  value: string | null;
  version: number | null;
  last_edited_at: Date | null;
};
export interface FileState extends LanguageInfo {
  fileName: string; //or fileID
  isDirty: boolean;
  keys: KeyState[];
}

export interface LanguageInfo {
  language_code: string;
  language_name: string;
}

export type TranslationValue = {
  id: string;
  value: string | null;
  fullKeyPath: string;
  language_code: string;
  language_name: string;
  filename: string;
  version: number | null;
  last_edited_at: Date | null;
};
