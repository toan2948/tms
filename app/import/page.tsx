"use client";

import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";
import { ChangeEvent, Suspense, useState } from "react";
// ==== Types ====
interface LanguageOption {
  code: string;
  name: string;
  id: string;
}

interface PendingFile {
  file: File;
  language: LanguageOption | null;
}

interface ApiResponse {
  ok: boolean;
  results?: {
    filename: string;
    language_code: string;
    fileId: string;
    languageId: string;
  }[];
  error?: string;
}

export default function ImportPage() {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const { languages } = useAllKeyFileStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add files (append mode)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((f) => ({
      file: f,
      language: null,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Remove one file
  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Change language selection for one file
  const handleLanguageChange = (index: number, languageId: string) => {
    const lang = languages.find((l) => l.language_id === languageId) ?? null;
    setFiles((prev) =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              language: {
                code: lang ? lang.language_code : "",
                name: lang ? lang.language_name : "",
                id: lang?.language_id ?? "",
              },
            }
          : f
      )
    );
  };

  // Upload to API
  const handleUpload = async () => {
    setError(null);
    setSuccess(null);

    // Validation
    for (const f of files) {
      if (!f.language) {
        setError(`Please select a language for file "${f.file.name}"`);
        return;
      }
    }

    try {
      setUploading(true);

      const formData = new FormData();
      const meta: Record<string, { code: string; name: string }> = {};

      files.forEach((pf) => {
        formData.append("files", pf.file);
        meta[pf.file.name] = {
          code: pf.language!.code,
          name: pf.language!.name,
        };
      });

      formData.append("meta", JSON.stringify(meta));

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data: ApiResponse = await res.json();

      if (!data.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        setSuccess(`Successfully uploaded ${data.results?.length ?? 0} files`);
        setFiles([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      localStorage.removeItem("filesStorage");
      redirect("/");
    }
  };

  return (
    <Suspense fallback={<div>Loading import…</div>}>
      <Box p={3}>
        <Typography variant='h4' gutterBottom>
          Import Translation Files
        </Typography>

        {/* File Input */}
        <Button variant='contained' component='label' sx={{ mb: 2 }}>
          Add Files
          <input
            type='file'
            hidden
            multiple
            accept='.json'
            onChange={handleFileChange}
          />
        </Button>

        {/* File List */}
        {files.map((pf, index) => (
          <Paper
            key={`${pf.file.name}-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              mb: 1,
              gap: 2,
            }}
          >
            <Typography sx={{ flex: 1 }}>{pf.file.name}</Typography>

            <FormControl sx={{ minWidth: 150 }} size='small'>
              <InputLabel>Language</InputLabel>

              <Select
                value={pf.language?.id ?? ""}
                label='Language'
                onChange={(e) => handleLanguageChange(index, e.target.value)}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.language_id} value={lang.language_id}>
                    {lang.language_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton onClick={() => handleRemove(index)}>
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}

        {/* Actions */}
        <Box mt={2}>
          <Button
            variant='contained'
            color='primary'
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Box>

        {/* Feedback */}
        {error && (
          <Typography color='error' mt={2}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color='success.main' mt={2}>
            {success}
          </Typography>
        )}
      </Box>
    </Suspense>
  );
}
