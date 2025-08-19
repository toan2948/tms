// app/api/import/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

/* ========= Types ========= */
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
type FileResult =
  | {
      ok: true;
      filenameOnDisk: string;
      filename: string;
      language_code: string;
      languageId: string;
      fileId: string;
    }
  | { ok: false; filenameOnDisk: string; error: string };

/* ========= Supabase ========= */

const supabase = await createClient();

/* ========= Helpers ========= */
function stripBOM(s: string): string {
  return s.replace(/^\uFEFF/, "");
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
      }")`
    );
  }
  const parsed = JSON.parse(cleaned) as unknown;
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${context} must be a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

function parseFilename(name: string): {
  filename: string;
  language_code: string;
} {
  // Accept either ".../foo_en.json" or "foo_en.json"
  const justName = name.split("/").pop() || name;
  const m = justName.match(/^(.+?)_([A-Za-z0-9-]+)\.json$/i);
  if (!m)
    throw new Error(
      `Filename must be "name_languageCode.json". Got "${justName}"`
    );
  const [, base, lang] = m;
  return { filename: base, language_code: lang.toLowerCase() };
}

function ensureDepthAllowed(level: number, fileName: string): void {
  if (level > 6) {
    throw new Error(`Max depth exceeded for ${fileName}: level ${level} > 6`);
  }
}

function serializeLeaf(v: JsonValue): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : JSON.stringify(v);
}

async function insertKeysInBatches(
  rows: TranslationKeyInsert[],
  batchSize = 800
): Promise<void> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("translation_keys").insert(chunk);
    if (error)
      throw new Error(`translation_keys insert failed: ${error.message}`);
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const rawFiles = formData.getAll("files");
    const files = rawFiles.filter((x): x is File => x instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { ok: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const seen = new Set<string>();
    const results: FileResult[] = [];

    for (const file of files) {
      const filenameOnDisk = file.name;
      try {
        if (!/\.json$/i.test(filenameOnDisk)) {
          throw new Error(`File "${filenameOnDisk}" is not a .json file`);
        }

        const { filename, language_code } = parseFilename(filenameOnDisk);
        const dupKey = `${filename}__${language_code}`;
        if (seen.has(dupKey)) {
          throw new Error(
            `Duplicate file+language in this batch: ${filename} (${language_code})`
          );
        }
        seen.add(dupKey);

        // Parse JSON (BOM-aware) and require object root
        const text = stripBOM(await file.text()).trim();
        const root = ensureRootObjectJSON(text, `file ${filenameOnDisk}`);
        const json = root as JsonObject;

        // Ensure language exists (name = code when creating)
        console.log("language_code", language_code);
        const { data: langSel, error: langSelErr } = await supabase
          .from("languages")
          .select("id")
          .eq("code", language_code)
          .maybeSingle<SupabaseLanguage>();
        if (langSelErr)
          throw new Error(`languages select failed: ${langSelErr.message}`);

        let languageId: string;
        if (langSel?.id) {
          languageId = langSel.id;
        } else {
          const ins = await supabase
            .from("languages")
            .insert({ code: language_code, name: language_code })
            .select("id")
            .single<SupabaseLanguage>();
          if (ins.error)
            throw new Error(`languages insert failed: ${ins.error.message}`);
          languageId = ins.data.id;
        }

        // Replace existing translation_files/keys for this (language, filename)
        const { data: existing, error: existErr } = await supabase
          .from("translation_files")
          .select("id")
          .eq("filename", filename)
          .eq("language_id", languageId);
        if (existErr)
          throw new Error(
            `translation_files select failed: ${existErr.message}`
          );

        if (existing?.length) {
          const ids = existing.map((r) => r.id);
          const delKeys = await supabase
            .from("translation_keys")
            .delete()
            .in("file_id", ids);
          if (delKeys.error)
            throw new Error(
              `translation_keys delete failed: ${delKeys.error.message}`
            );
          const delFiles = await supabase
            .from("translation_files")
            .delete()
            .in("id", ids);
          if (delFiles.error)
            throw new Error(
              `translation_files delete failed: ${delFiles.error.message}`
            );
        }

        // Insert new translation_files row
        const insFile = await supabase
          .from("translation_files")
          .insert({ language_id: languageId, filename })
          .select("id")
          .single<SupabaseTranslationFile>();
        if (insFile.error)
          throw new Error(
            `translation_files insert failed: ${insFile.error.message}`
          );
        const fileId = insFile.data.id;

        // Walk tree -> translation_keys (levels 0–6)
        const rows: TranslationKeyInsert[] = [];
        function walk(
          obj: JsonObject,
          path: string[],
          level: number,
          parentId: string | null
        ): void {
          ensureDepthAllowed(level, filenameOnDisk);
          for (const [segment, value] of Object.entries(obj)) {
            if (!segment)
              throw new Error(
                `Empty key segment at "${path.join(".")}" in ${filenameOnDisk}`
              );
            const full = [...path, segment].join(".");
            const isObj =
              typeof value === "object" &&
              value !== null &&
              !Array.isArray(value);
            const id = uuidv4();
            rows.push({
              id,
              file_id: fileId,
              parent_id: parentId,
              key_path_segment: segment,
              value: isObj ? null : serializeLeaf(value),
              full_key_path: full,
              level,
              has_children: isObj,
            });
            if (isObj)
              walk(value as JsonObject, [...path, segment], level + 1, id);
          }
        }
        walk(json, [], 0, null);

        if (rows.length) await insertKeysInBatches(rows);

        results.push({
          ok: true,
          filenameOnDisk,
          filename,
          language_code,
          languageId,
          fileId,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ ok: false, filenameOnDisk, error: msg });
      }
    }

    const anyFail = results.some((r) => !r.ok);
    return NextResponse.json(
      { ok: !anyFail, results },
      { status: anyFail ? 207 : 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("Import error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
