// app/api/import/route.ts
export const runtime = "nodejs";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

/* ========= Types ========= */
interface LanguageOption {
  language_code: string;
  language_name: string;
}
interface MetaData {
  [filename: string]: LanguageOption;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface SupabaseLanguage {
  id: string;
}
interface SupabaseTranslationFile {
  id: string;
}
interface TranslationKeyInsert {
  id: string;
  file_id: string;
  parent_id: string | null;
  key_path_segment: string;
  value: string | null;
  full_key_path: string;
  level: number;
  has_children: boolean;
}
interface UploadResult {
  filename: string;
  language_code: string;
  fileId: string;
  languageId: string;
}

/* ========= Supabase ========= */
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ========= Helpers ========= */
function stripBOM(s: string): string {
  return s.replace(/^\uFEFF/, "");
}

async function readFormDataText(entry: FormDataEntryValue): Promise<string> {
  if (typeof entry === "string") return entry;
  if (entry instanceof Blob) return await entry.text(); // handles File/Blob
  throw new Error("Unexpected form-data value type");
}

function ensureRootObjectJSON(
  input: string,
  context: string
): Record<string, unknown> {
  const cleaned = stripBOM(input).trim();
  if (!cleaned.startsWith("{")) {
    throw new Error(
      `${context} is not valid JSON (starts with "${
        cleaned.slice(0, 12) || "(empty)"
      }"). ` +
        `Append it as JSON: formData.append('meta', JSON.stringify(meta))`
    );
  }
  const parsed = JSON.parse(cleaned) as unknown;
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${context} must be a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

function parseMeta(metaText: string): MetaData {
  const obj = ensureRootObjectJSON(metaText, "meta");
  const out: MetaData = {};
  for (const [filename, val] of Object.entries(obj)) {
    const v = val as Record<string, unknown>;
    // accept either {language_code, language_name} or {code, name}
    const language_code =
      typeof v?.language_code === "string"
        ? v.language_code
        : typeof v?.code === "string"
        ? (v.code as string)
        : "";
    const language_name =
      typeof v?.language_name === "string"
        ? v.language_name
        : typeof v?.name === "string"
        ? (v.name as string)
        : "";
    if (!language_code || !language_name) {
      throw new Error(
        `Invalid meta for "${filename}". Expected { language_code, language_name }`
      );
    }
    out[filename] = { language_code, language_name };
  }
  return out;
}

function ensureDepthAllowed(level: number, fileName: string): void {
  if (level > 6) {
    throw new Error(
      `Max translation key depth exceeded in ${fileName} (level ${level} > 6).`
    );
  }
}

/* ========= Route ========= */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    // DEBUG: echo what we received (use ?debug=1 on your POST URL)
    if (req.nextUrl.searchParams.get("debug") === "1") {
      const metaEntry = formData.get("meta");
      const rawFiles = formData.getAll("files");

      const metaType =
        metaEntry == null
          ? "null"
          : typeof metaEntry === "string"
          ? "string"
          : metaEntry instanceof Blob
          ? "blob"
          : typeof metaEntry;

      const metaPreview = metaEntry
        ? typeof metaEntry === "string"
          ? metaEntry.slice(0, 80)
          : metaEntry instanceof Blob
          ? `blob(${metaEntry.type || "no-type"})`
          : String(metaEntry)
        : "(missing)";

      const fileSummaries = rawFiles.map((f) => {
        if (f instanceof File)
          return { name: f.name, type: f.type || "(none)", size: f.size };
        return { notAFile: true, valueType: typeof f };
      });

      return NextResponse.json({
        ok: true,
        debug: {
          metaType,
          metaPreview,
          filesCount: rawFiles.length,
          files: fileSummaries,
          note: "If metaType !== 'string', ensure you append JSON.stringify(meta) on the client.",
        },
      });
    }

    console.log(
      "meta first 40 chars:",
      formData.get("meta")?.toString().slice(0, 40) || "(empty)"
    );
    // Parse meta (string OR Blob) safely
    const metaEntry = formData.get("meta");
    if (!metaEntry) {
      return NextResponse.json(
        { ok: false, error: "Missing meta" },
        { status: 400 }
      );
    }
    const metaRaw = await readFormDataText(metaEntry);
    let meta: MetaData;

    try {
      meta = parseMeta(metaRaw);
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: (e as Error).message },
        { status: 400 }
      );
    }

    // Files
    const rawFiles = formData.getAll("files");
    const files = rawFiles.filter((x): x is File => x instanceof File);
    if (!files.length) {
      return NextResponse.json(
        { ok: false, error: "No files provided" },
        { status: 400 }
      );
    }

    // Duplicate guard within this request
    const seen = new Set<string>();
    for (const file of files) {
      const lang = meta[file.name];
      if (!lang?.language_code) {
        return NextResponse.json(
          { ok: false, error: `Missing language for file ${file.name}` },
          { status: 400 }
        );
      }
      const key = `${file.name}__${lang.language_code}`;
      if (seen.has(key)) {
        return NextResponse.json(
          {
            ok: false,
            error: `Duplicate file+language in this batch: ${file.name} (${lang.language_code})`,
          },
          { status: 400 }
        );
      }
      seen.add(key);
    }

    const results: UploadResult[] = [];

    // Process each file
    for (const file of files) {
      if (!/\.json$/i.test(file.name)) {
        throw new Error(`File "${file.name}" is not a .json file`);
      }

      // Parse file JSON safely (BOM-aware, must be object)
      const text = stripBOM(await file.text()).trim();
      const root = ensureRootObjectJSON(text, `file ${file.name}`);
      const json = root as JsonObject;

      const lang = meta[file.name]!;
      const filenameWithoutExt = file.name.replace(/\.[^.]+$/i, "");

      // Ensure language exists by code
      const { data: langData, error: langErr } = await supabase
        .from("languages")
        .select("id")
        .eq("code", lang.language_code)
        .maybeSingle<SupabaseLanguage>();
      if (langErr) throw langErr;

      let languageId: string;
      if (langData?.id) {
        languageId = langData.id;
      } else {
        const { data: newLang, error: insertLangErr } = await supabase
          .from("languages")
          .insert({ code: lang.language_code, name: lang.language_name })
          .select("id")
          .single<SupabaseLanguage>();
        if (insertLangErr) throw insertLangErr;
        languageId = newLang.id;
      }

      // Replace existing (delete keys -> delete files)
      const { data: existingFiles, error: fetchFileErr } = await supabase
        .from("translation_files")
        .select("id")
        .eq("filename", filenameWithoutExt)
        .eq("language_id", languageId);
      if (fetchFileErr) throw fetchFileErr;

      if (existingFiles?.length) {
        const fileIds = existingFiles.map((f) => f.id);
        const { error: delKeysErr } = await supabase
          .from("translation_keys")
          .delete()
          .in("file_id", fileIds);
        if (delKeysErr) throw delKeysErr;

        const { error: delFilesErr } = await supabase
          .from("translation_files")
          .delete()
          .in("id", fileIds);
        if (delFilesErr) throw delFilesErr;
      }

      // Insert file row
      const { data: insertedFile, error: insertFileErr } = await supabase
        .from("translation_files")
        .insert({ language_id: languageId, filename: filenameWithoutExt })
        .select("id")
        .single<SupabaseTranslationFile>();
      if (insertFileErr) throw insertFileErr;

      const fileId = insertedFile.id;

      // Walk tree -> translation_keys (levels 0–6)
      const keysToInsert: TranslationKeyInsert[] = [];
      function walk(
        obj: JsonObject,
        path: string[],
        level: number,
        parentId: string | null
      ): void {
        ensureDepthAllowed(level, file.name);
        for (const [segment, value] of Object.entries(obj)) {
          const fullKeyPath = [...path, segment].join(".");
          const isObj =
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value);
          const id = uuidv4();
          keysToInsert.push({
            id,
            file_id: fileId,
            parent_id: parentId,
            key_path_segment: segment,
            value: isObj ? null : value === null ? null : String(value),
            full_key_path: fullKeyPath,
            level,
            has_children: isObj,
          });
          if (isObj) {
            walk(value as JsonObject, [...path, segment], level + 1, id);
          }
        }
      }
      walk(json, [], 0, null);

      if (keysToInsert.length) {
        const { error: insertKeysErr } = await supabase
          .from("translation_keys")
          .insert(keysToInsert);
        if (insertKeysErr) throw insertKeysErr;
      }

      results.push({
        filename: file.name,
        language_code: lang.language_code,
        fileId,
        languageId,
      });
    }

    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Import error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
