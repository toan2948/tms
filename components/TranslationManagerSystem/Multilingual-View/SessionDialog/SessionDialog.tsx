import * as React from "react";

import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { FileState, TranslationValue } from "@/types/translation";

export interface SessionDialogProps {
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
}

export function SessionDialog({ open, onClose }: SessionDialogProps) {
  const localStorageFilesInfo: FileState[] = localStorage.getItem(
    "translationEdits"
  )
    ? JSON.parse(localStorage.getItem("translationEdits") as string)
    : [];
  const changedKeys: TranslationValue[] = localStorageFilesInfo.flatMap(
    (file) =>
      file.keys
        .filter((key) => key.isChanged)
        .map((key) => ({
          id: key.id,
          value: key.value,
          fullKeyPath: key.fullKeyPath,
          language_code: file.language_code,
          language_name: file.language_name,
          filename: file.fileName,
        }))
  );
  const groupedMap = new Map<string, Set<string>>();

  changedKeys.forEach((item) => {
    const groupKey = `${item.filename}: ${item.fullKeyPath}`;
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, new Set());
    }
    groupedMap.get(groupKey)!.add(item.language_code);
  });

  // Convert to array of strings
  const changedKeyStrings: string[] = Array.from(groupedMap.entries()).map(
    ([key, langSet]) => `${key} -- ${Array.from(langSet).join(", ")}`
  );

  console.log("Changed Keys:", changedKeyStrings);

  const handleClose = () => {
    onClose(false);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Set backup account</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListItem disablePadding>
          <ListItemText primary='Add account' />
        </ListItem>
      </List>
    </Dialog>
  );
}
