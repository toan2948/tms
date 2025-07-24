// -----------------------------------
// Shared Base Interfaces
// -----------------------------------

export interface WithLanguage {
  language_code: string;
  language_name: string;
}

export interface WithVersion {
  version: number;
  old_version?: number;
}

export interface WithTimestamps {
  last_edited_at?: Date | null;
  added_at?: Date | null;
}

export interface WithHierarchy {
  parent_id: string | null;
  key_path_segment: string;
  full_key_path: string;
  level: number;
  has_children: boolean;
}

export interface WithNotes {
  notes: string | null;
}

// -----------------------------------
// Language Types
// -----------------------------------

export interface LanguageType {
  // For data returned from the "language" table
  code: string;
  name: string;
}

// -----------------------------------
// Key Value Types
// -----------------------------------

export interface BaseKeyValue
  extends WithVersion,
    WithTimestamps,
    WithHierarchy,
    WithLanguage,
    WithNotes {
  id: string;
  file_id?: string;
  fileName?: string;
  value: string | null;
  old_value: string | null;
  isNew?: boolean;
}

export interface KeyState extends BaseKeyValue {
  isChanged: boolean;
}

export type KeyStateWithoutOld = Omit<KeyState, "old_value" | "old_version">;

// -----------------------------------
// File State
// -----------------------------------

export interface FileState<T extends KeyState | KeyStateWithoutOld>
  extends WithLanguage {
  file_id: string;
  fileName: string;
  isDirty: boolean;
  keys: T[];
}

// -----------------------------------
// Translation Keys
// -----------------------------------

export interface BaseTranslationKey extends WithHierarchy, WithNotes {
  id: string;
  file_id: string;
}

export interface TranslationKey
  extends BaseTranslationKey,
    WithVersion,
    WithTimestamps {
  value: string | null;
  status: "done" | "error" | "missing";
  score: number | null;
  ticket_number: string | null;
  pr_number: string | null;

  // For building UI trees
  children?: TranslationKey[];
}

// -----------------------------------
// Tree Type
// -----------------------------------

export type TreeNode<T> = T & { children?: TreeNode<T>[] };
export type TranslationTreeKey = TreeNode<BaseTranslationKey>;
