import { NestedObject } from "@/store/store";
import { TranslationKey } from "@/types/translation";
import { createClient } from "@/utils/supabase/server";

export async function TreeData() {
  const supabase = await createClient();

  const { data } = await supabase.from("EN_kv").select("*");

  return JSON.stringify(data ?? {}, null, 2);
}
type InputItem = {
  key: string;
  value: string;
};

export async function getTreeDataKey() {
  const supabase = await createClient();
  const data = await supabase
    .from("EN_kv")
    .select("value, full_path")
    .then((response) =>
      response.data?.map((item) => ({
        key: item.full_path as string, // Alias full_path as key
        value: item.value as string,
      }))
    );

  console.log("Data from getTreeDataKey", data);

  const treeData = convertToNestedObjects2(data || []);
  return treeData;
}

export async function fetchTranslationKeysByFileId(
  filename: string,
  languageCode: string
): Promise<TranslationKey[]> {
  const supabase = await createClient();

  const { data: language, error: langError } = await supabase
    .from("languages")
    .select("id")
    .eq("code", languageCode)
    .single();

  if (langError || !language) {
    throw new Error(
      `Language "${languageCode}" not found: ${langError?.message}`
    );
  }

  const { data: file, error: fileError } = await supabase
    .from("translation_files")
    .select("id")
    .eq("filename", filename)
    .eq("language_id", language.id)
    .single();

  if (fileError || !file) {
    throw new Error(
      `File "${filename}" not found or query failed: ${fileError?.message}`
    );
  }

  // Now get all translation keys for that file_id
  const { data: keys, error: keyError } = await supabase
    .from("translation_keys")
    .select(
      `
      id,
      file_id,
      parent_id,
      key_path_segment,
      value,
      full_key_path,
      level,
      added_at,
      last_edited_at,
      version,
      status,
      score,
      notes,
      ticket_number,
      pr_number
    `
    )
    .eq("file_id", file.id)
    .order("level", { ascending: true });

  if (keyError) {
    throw new Error(`Error fetching keys: ${keyError.message}`);
  }

  console.log("Fetched translation keys:", keys);

  return keys ?? [];
}

// types.ts

export function convertToNestedObjects2(data: InputItem[]): NestedObject[] {
  const grouped: Record<string, NestedObject> = {};

  data.forEach(({ key, value }) => {
    const parts = key.split(">").map((part) => part.trim());
    const root = parts[0];

    if (!grouped[root]) grouped[root] = {};

    let current: NestedObject = grouped[root];
    for (let i = 1; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part] as NestedObject;
    }

    current[parts[parts.length - 1]] = value;
  });

  return Object.keys(grouped).map((key) => ({ [key]: grouped[key] }));
}

export type TreeNode = {
  title: string;
  key: string;
  children?: TreeNode[];
};

// The input data is an array of objects with string keys and nested values (string or nested objects)
type NestedData = {
  [key: string]: string | NestedData;
};

export function buildTree(dataArray: NestedData[]): TreeNode[] {
  const result: TreeNode[] = [];

  function traverse(obj: NestedData, parentKey = ""): TreeNode[] {
    return Object.entries(obj).map(([key, value]) => {
      const fullKey = parentKey ? `${parentKey} > ${key}` : key;

      if (typeof value === "object" && value !== null) {
        return {
          title: key,
          key: fullKey,
          children: traverse(value, fullKey),
        };
      } else {
        return {
          title: key,
          key: fullKey,
        };
      }
    });
  }

  for (const item of dataArray) {
    for (const topKey in item) {
      result.push({
        title: topKey,
        key: topKey,
        children: traverse(item[topKey] as NestedData, topKey),
      });
    }
  }

  return result;
}
