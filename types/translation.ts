interface BaseTranslationKey {
  id: string;
  file_id: string;
  parent_id: string | null;
  key_path_segment: string;
  full_key_path: string;
  level: number;
  has_children: boolean;
  notes: string | null;
}
export interface TranslationKey extends BaseTranslationKey {
  value: string | null;
  added_at: Date | null;
  last_edited_at: Date | null;
  version: number;
  status: "done" | "error" | "missing";
  score: number | null;
  notes: string | null;
  ticket_number: string | null;
  pr_number: string | null;

  // For building UI trees
  children?: TranslationKey[];
}
export interface TranslationTreeKey extends BaseTranslationKey {
  children?: TranslationTreeKey[];
}
export type KeyState = {
  fullKeyPath: string;
  id: string;
  isChanged: boolean;
  value: string | null;
  version: number;
  last_edited_at: Date | null;
  has_children: boolean;
  parent_id: string | null;
  notes: string | null;
  isNew?: boolean; // Indicates if the key is newly added
};
export interface LanguageInfo {
  language_code: string;
  language_name: string;
}

export interface LanguageType {
  code: string;
  name: string;
}
export interface FileState extends LanguageInfo {
  fileName: string; //or fileID
  isDirty: boolean;
  keys: KeyState[];
}

export type TranslationValue = {
  id: string;
  value: string | null;
  fullKeyPath: string;
  language_code: string;
  language_name: string;
  filename: string;
  version: number;
  last_edited_at: Date | null;
  has_children: boolean;
  parent_id: string | null;
  notes: string | null;
  isNew?: boolean; // Indicates if the value is newly added
};
export type TranslationValueWithOld = TranslationValue & {
  old_value: string | null;
};
