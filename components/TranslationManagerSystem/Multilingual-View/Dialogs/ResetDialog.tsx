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
  // console.log("changedKeys", changedKeys);
  const handleClose = () => {
    onClose(false);
  };
  const { fullKeyPath } = useKeyStore();
  const { updateKeyChanged } = useEditAllFileStore();
  const localStorageDBValues = React.useMemo(() => {
    return localStorage.getItem("currentDBvalues")
      ? JSON.parse(localStorage.getItem("currentDBvalues") as string)
      : [];
  }, [data]);

  const DBValue = React.useMemo(
    () => findKeyStateByIdAcrossFiles(localStorageDBValues, data.id),
    [data.id, localStorageDBValues]
  );
  const handleReset = () => {
    // console.log("Resetting value to DBValue:", DBValue?.value, value);
    updateKeyChanged({
      fullKeyPath: fullKeyPath,
      id: data.id,
      isChanged: false,
      value: DBValue?.value ?? "",
      version: data.version ? data.version - 1 : 0,
      last_edited_at: DBValue?.last_edited_at
        ? new Date(DBValue.last_edited_at)
        : new Date(),
      has_children: data.has_children,
    });
    setValue(DBValue?.value ?? "");
    setIsSaveButtonEnabled(false);
    setIsResetButtonEnabled(false);
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
