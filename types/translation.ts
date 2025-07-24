export interface LanguageInfo {
  language_code: string;
  language_name: string;
}

export interface LanguageType {
  //for the returned data from the table "language"
  code: string;
  name: string;
}

export interface BaseKeyValue {
  id: string;
  full_key_path: string;
  value: string | null;
  version: number;
  last_edited_at: Date | null;
  has_children: boolean;
  parent_id: string | null;
  notes: string | null;
  old_value: string | null; // Previous value before the change
  old_version?: number; // Previous version before the change
  isNew?: boolean; // Indicates if the key is newly added
}
export type KeyState = BaseKeyValue & {
  isChanged: boolean;
};
export type KeyStateWithoutOld = Omit<KeyState, "old_value" | "old_version">;
export type TranslationValue = BaseKeyValue & {
  language_code: string;
  language_name: string;
  filename: string;
};
export interface FileState<T extends KeyState | KeyStateWithoutOld>
  extends LanguageInfo {
  fileName: string;
  isDirty: boolean;
  keys: T[];
}

export interface BaseTranslationKey {
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

export type TreeNode<T> = T & { children?: TreeNode<T>[] };
export type TranslationTreeKey = TreeNode<BaseTranslationKey>;
