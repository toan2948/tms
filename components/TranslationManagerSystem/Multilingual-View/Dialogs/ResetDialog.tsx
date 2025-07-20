import * as React from "react";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useKeyStore } from "@/store/useFileNameStore";
import { findKeyStateByIdAcrossFiles } from "@/utils/languages/processData";
import { TranslationValue, TranslationValueWithOld } from "@/types/translation";

export interface DialogProps {
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  setValue: React.Dispatch<React.SetStateAction<string | null>>;

  setIsSaveButtonEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResetButtonEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  data: TranslationValue | TranslationValueWithOld;
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
  const { selectedTreeKey } = useKeyStore();
  const { updateKeyChanged, DBFilesInfo } = useEditAllFileStore();

  const DBValue = React.useMemo(
    () => findKeyStateByIdAcrossFiles(DBFilesInfo, data.id),
    [data.id, DBFilesInfo]
  );
  const handleReset = () => {
    // console.log("Resetting value to DBValue:", DBValue?.value, value);
    updateKeyChanged({
      fullKeyPath: selectedTreeKey?.full_key_path
        ? selectedTreeKey.full_key_path
        : "",
      id: data.id,
      isChanged: false,
      value: DBValue?.value ?? "",
      version: data.version ? data.version - 1 : 0,
      last_edited_at: DBValue?.last_edited_at
        ? new Date(DBValue.last_edited_at)
        : new Date(),
      has_children: data.has_children,
      parent_id: data.parent_id,
    });
    setValue(DBValue?.value ?? "");
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
