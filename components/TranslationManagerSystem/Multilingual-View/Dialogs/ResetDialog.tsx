import * as React from "react";

import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { KeyState } from "@/types/keyType";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

export interface DialogProps {
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  setValue: React.Dispatch<React.SetStateAction<string | null>>;

  setIsSaveButtonEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResetButtonEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  data: KeyState;
}

export function ResetDialog({
  open,
  onClose,
  setValue,
  data,
  setIsSaveButtonEnabled,
  setIsResetButtonEnabled,
}: DialogProps) {
  const handleClose = () => {
    onClose(false);
  };
  const { selectedTreeKey } = useTreeKeyStore();
  const { updateKeyChanged } = useAllKeyFileStore();

  const handleReset = () => {
    // console.log("Resetting value to DBValue:", DBValue?.value, value);
    updateKeyChanged({
      full_key_path: selectedTreeKey?.full_key_path
        ? selectedTreeKey.full_key_path
        : "",
      id: data.id,
      isChanged: false,
      value: data.old_value ?? "",
      version: data.old_version ?? 0,
      last_edited_at: data?.last_edited_at //old_edit
        ? new Date(data.last_edited_at) //old_edit
        : new Date(),
      has_children: data.has_children,
      parent_id: data.parent_id,
      notes: data.notes,
      old_value: data.old_value, // Store the old value before resetting
      key_path_segment: data.key_path_segment,
      level: data.level,
      language_code: data.language_code,
      language_name: data.language_name,
      file_id: data.file_id,
      isNew: data.isNew,
    });
    setValue(data.old_value ?? ""); // Reset the value to the old value
    setIsSaveButtonEnabled(false);
    setIsResetButtonEnabled(false);
    onClose(false);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle textAlign={"center"}>Reset Translation</DialogTitle>
      <Box
        sx={{
          padding: "10px",
        }}
      >
        <Typography sx={{ padding: "10px" }}>
          Do you want to undo/reset this translation
        </Typography>
        <Stack direction={"row"} justifyContent={"flex-end"}>
          <Button
            variant='outlined'
            sx={{
              marginRight: "10px",
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button variant='contained' onClick={handleReset}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
