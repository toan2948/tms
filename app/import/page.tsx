"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

/* ========= Types ========= */
interface PendingFile {
  file: File;
  filenameBase: string | null; // parsed "name"
  languageCode: string | null; // parsed "languageCode"
  error?: string; // filename validation error
}

interface ApiSuccessItem {
  ok: true;
  filenameOnDisk: string;
  filename: string;
  language_code: string;
  languageId: string;
  fileId: string;
}
interface ApiErrorItem {
  ok: false;
  filenameOnDisk: string;
  error: string;
}
type ApiItem = ApiSuccessItem | ApiErrorItem;

interface ApiResponse {
  ok: boolean;
  results: ApiItem[];
}

/* ========= Helpers ========= */
function parseFilenameFromDisk(name: string): {
  filenameBase: string | null;
  languageCode: string | null;
  error?: string;
} {
  const just = name.split("/").pop() || name;
  const m = just.match(/^(.+?)_([A-Za-z0-9-]+)\.json$/i);
  console.log("parseFilenameFromDisk", { name, just, m });
  if (!m)
    return {
      filenameBase: null,
      languageCode: null,
      error: `Must be "name_languageCode.json"`,
    };
  return { filenameBase: m[1], languageCode: m[2].toLowerCase() };
}

/* ========= Component ========= */
export default function ImportPage() {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverResults, setServerResults] = useState<ApiItem[] | null>(null);
  const router = useRouter();
  useEffect(() => {
    // Prefetch the import page to improve performance when navigating
    router.prefetch?.("/");
  }, [router]);
  const hasInvalid = useMemo(
    () => files.some((f) => !f.filenameBase || !f.languageCode),
    [files]
  );

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newOnes: PendingFile[] = Array.from(e.target.files).map((f) => {
      const parsed = parseFilenameFromDisk(f.name);
      return {
        file: f,
        filenameBase: parsed.filenameBase,
        languageCode: parsed.languageCode,
        error: parsed.error,
      };
    });
    setFiles((prev) => [...prev, ...newOnes]);
    e.target.value = ""; // allow re-adding same file name later
    setMessage(null);
    setServerResults(null);
  };

  const removeAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    setMessage(null);
    setServerResults(null);

    if (files.length === 0) {
      setMessage("Please add at least one file.");
      return;
    }
    if (hasInvalid) {
      setMessage('Some file names are invalid. Use "name_languageCode.json".');
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      for (const pf of files) {
        fd.append("files", pf.file);
      }
      console.log("fd", fd);
      const res = await fetch("/api/import", { method: "POST", body: fd });

      const text = await res.text();
      let data: ApiResponse | null = null;
      try {
        data = JSON.parse(text) as ApiResponse;
      } catch {
        setMessage(
          `Server returned non-JSON (status ${
            res.status
          }). First 200 chars:\n${text.slice(0, 200)}`
        );
        return;
      }

      setServerResults(data.results);
      if (!data.ok) {
        const failed = data.results.filter((r) => !r.ok) as ApiErrorItem[];
        setMessage(
          `Some files failed: ${failed
            .map((f) => `${f.filenameOnDisk}: ${f.error}`)
            .join("; ")}`
        );
      } else {
        setMessage(`Imported ${data.results.length} file(s) successfully.`);
        setFiles([]); // clear selection on success-all
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
    localStorage.removeItem("filesStorage");
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Import Translation Files (name_languageCode.json)
      </Typography>

      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <Button
          variant='contained'
          component={Link}
          prefetch
          sx={{ mb: 2 }}
          href='/'
        >
          Home Page
        </Button>

        <Button variant='contained' component='label' sx={{ mb: 2 }}>
          Add Files
          <input
            type='file'
            hidden
            multiple
            accept='.json'
            onChange={onFileChange}
          />
        </Button>
      </Stack>

      {files.map((pf, idx) => (
        <Paper
          key={`${pf.file.name}-${idx}`}
          sx={{
            p: 1.5,
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ flex: 1 }}>{pf.file.name}</Typography>

          {pf.error ? (
            <Chip color='error' label={pf.error} />
          ) : (
            <>
              <Chip label={`name: ${pf.filenameBase}`} />
              <Chip label={`lang: ${pf.languageCode}`} />
            </>
          )}

          <IconButton aria-label='remove' onClick={() => removeAt(idx)}>
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      {files.length > 0 && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Button
            variant='contained'
            onClick={handleUpload}
            disabled={busy || hasInvalid}
          >
            {busy ? "Uploading..." : "Upload"}
          </Button>
        </Box>
      )}

      {message && (
        <Typography
          sx={{ whiteSpace: "pre-wrap" }}
          color={
            serverResults && !serverResults.every((r) => r.ok)
              ? "error"
              : "success.main"
          }
        >
          {message}
        </Typography>
      )}

      {serverResults && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='subtitle1'>Server results</Typography>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f6f8fa",
              padding: 12,
              borderRadius: 8,
            }}
          >
            {JSON.stringify(serverResults, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
}
