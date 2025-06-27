import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

interface FileMeta {
  editor: string;
  ticket: string;
  pr: string;
}

interface FlattenedKey {
  id: string;
  key_path_segment: string;
  full_key_path: string;
  level: number;
  value: string | null;
  children: FlattenedKey[];
}

// Supabase client setup
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Flatten nested JSON to tree-compatible structure
function flattenJSON(
  obj: JsonObject,
  parentPath: string[] = [],
  level = 0
): FlattenedKey[] {
  const result: FlattenedKey[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...parentPath, key];
    const fullKeyPath = currentPath.join(".");
    const segment = key;

    const record: FlattenedKey = {
      id: uuidv4(),
      key_path_segment: segment,
      full_key_path: fullKeyPath,
      level,
      value: typeof value === "string" ? value : null,
      children: [],
    };

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const children = flattenJSON(value as JsonObject, currentPath, level + 1);
      record.children = children;
    }

    result.push(record);
  }

  return result.flatMap((r) => [r, ...r.children]);
}

// Insert a language file's data into Supabase
async function seedLanguageFile(
  langCode: string,
  fileName: string,
  jsonData: JsonObject,
  fileMeta: FileMeta
): Promise<void> {
  const { data: langData, error: langError } = await supabase
    .from("languages")
    .select("id")
    .eq("code", langCode)
    .single();

  if (langError || !langData) {
    throw new Error(`Language not found: ${langCode}`);
  }

  const language_id = langData.id;
  const { data: existingFile } = await supabase
    .from("translation_files")
    .select("id")
    .eq("filename", fileName)
    .eq("language_id", language_id)
    .single();

  const fileId = existingFile?.id ?? crypto.randomUUID(); // only create new if not found

  const { data: fileData, error: fileError } = await supabase
    .from("translation_files")
    .upsert(
      {
        id: fileId,
        language_id,
        filename: fileName,
        last_editor: fileMeta.editor,
        ticket_number: fileMeta.ticket,
        pr_number: fileMeta.pr,
      },
      {
        onConflict: "filename,language_id",
      }
    )
    .select("id")
    .single();

  if (fileError || !fileData) {
    console.error("🔥 Error upserting translation file:", fileName);
    console.error(fileError);
    throw new Error(`Failed to upsert file: ${fileName}`);
  }

  const file_id = fileData.id;

  const flattened = flattenJSON(jsonData);
  const idMap = new Map<string, string>(); // fullKeyPath -> id

  for (const node of flattened) {
    const parentPath = node.full_key_path.split(".").slice(0, -1).join(".");
    const parent_id = idMap.get(parentPath) || null;

    const { error } = await supabase.from("translation_keys").insert({
      id: node.id,
      file_id,
      parent_id,
      key_path_segment: node.key_path_segment,
      full_key_path: node.full_key_path,
      level: node.level,
      value: node.value,
      added_at: new Date().toISOString(),
      last_edited_at: new Date().toISOString(),
      status: "done",
      version: 1,
    });

    if (error) {
      console.error(`Failed to insert key: ${node.full_key_path}`, error);
    }

    idMap.set(node.full_key_path, node.id);
  }

  console.log(
    `✅ Seeded ${fileName} (${langCode}) with ${flattened.length} keys`
  );
}

// Main execution function
async function main() {
  const basePath = "./translations"; // folder like ./translations/en/home.json
  const langs = fs.readdirSync(basePath);

  for (const lang of langs) {
    const files = fs.readdirSync(path.join(basePath, lang));

    for (const file of files) {
      const jsonPath = path.join(basePath, lang, file);
      const jsonContent = JSON.parse(
        fs.readFileSync(jsonPath, "utf8")
      ) as JsonObject;

      const meta: FileMeta = {
        editor: "admin@yourdomain.com",
        ticket: "T-123",
        pr: "PR-456",
      };

      const filenameWithoutExt = path.parse(file).name;
      await seedLanguageFile(lang, filenameWithoutExt, jsonContent, meta);
    }
  }

  console.log("🌱 All translations seeded!");
}

main().catch((err) => {
  console.error("❌ Error during seeding:", err);
  process.exit(1);
});
