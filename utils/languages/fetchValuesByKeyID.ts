"use client";

import { createClient } from "../supabase/client";

export type TranslationValue_Xoa = {
  value: string;
  full_key_path: string;
  translation_files: {
    filename: string;
    languages: {
      code: string;
      name: string;
    }[];
  }[];
};
export async function fetchTranslationsByPathAndFilename(
  fullKeyPath: string,
  filename: string
): Promise<TranslationValue_Xoa[]> {
  const supabase = createClient();

  if (fullKeyPath === "" || filename === "") {
    return []; // Return empty array if no key or filename is provided
  }

  const { data, error } = await supabase
    .from("translation_keys")
    .select(
      `
      value,
      full_key_path,
      translation_files (
        filename,
        languages (
          code,
          name
        )
      )
    `
    )
    .eq("full_key_path", fullKeyPath)
    .eq("translation_files.filename", filename);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(
      `No translations found for key "${fullKeyPath}" in file "${filename}"`
    );
  }

  return data;
}

export async function TStep(
  fullKeyPath: string,
  filename: string
): Promise<
  Promise<
    {
      language_name: string;
      language_code: string;
      filename: string;
      id: string;
      value: string | null;
    }[]
  >
> {
  const supabase = createClient();

  if (fullKeyPath === "" || filename === "") {
    return []; // Return empty array if no key or filename is provided
  }

  const { data, error } = await supabase
    .from("translation_files_with_language")
    .select(
      `
      language_name,
      language_code,
      filename,
      id
    `
    )
    .eq("filename", filename);

  const keys = [];
  if (data) {
    for (const item of data) {
      const key = fetchKeyValue(item.id, fullKeyPath);
      keys.push({
        language_name: item.language_name,
        language_code: item.language_code,
        filename: item.filename,
        id: key ? (await key)?.id ?? null : null,
        value: key ? (await key)?.value ?? null : null, // Fetch the value for the full key path
        // full_key_path: fullKeyPath,
      });
    }
  }

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(
      `No translations found for key "${fullKeyPath}" in file "${filename}"`
    );
  }

  return keys;
}

async function fetchKeyValue(id: string, fullKey: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("translation_keys")
    .select("value, full_key_path,id")
    .eq("file_id", id)
    .eq("full_key_path", fullKey);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  if (data) {
    return data[0]; // Return the first matching key value
  }
}
