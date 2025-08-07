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
  id: string;
  parent_id: string | null;
  key_path_segment: string;
  old_segment?: string | null;
  full_key_path: string;
  old_full_key_path?: string | null;
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

export interface KeyState
  extends WithVersion,
    WithTimestamps,
    WithHierarchy,
    WithLanguage,
    WithNotes {
  file_id?: string;
  fileName?: string;
  value: string | null;
  old_value: string | null;
  isNew?: boolean;
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
// Tree Type
// -----------------------------------

export interface KeyNode extends WithHierarchy, WithNotes, WithLanguage {
  isNew?: boolean;
}

export type TreeNode<T> = T & { children?: TreeNode<T>[] };
export type TranslationTreeKey = TreeNode<KeyNode>;
