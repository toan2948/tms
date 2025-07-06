import * as React from "react";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import {
  filterTranslationKeys,
  formatSessionDialogData,
} from "@/utils/languages/processData";
import {
  fetchAllTranslationFiles,
  updateChangedKeys,
} from "@/utils/languages/dataFunctions";
import { toast } from "react-toastify";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
export interface SessionDialogProps {
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
}

export function SessionDialog({ open, onClose }: SessionDialogProps) {
  const { filesInfo, initialSet } = useEditAllFileStore();

  const changedKeys = filterTranslationKeys(filesInfo);
  const sessionData = formatSessionDialogData(changedKeys);

  console.log("changedKeys", changedKeys);
  const handleClose = () => {
    onClose(false);
  };

  const updateDB = async () => {
    await updateChangedKeys(changedKeys);
    onClose(false);
    toast.success("Saved to DB!");
    const data = await fetchAllTranslationFiles();
    initialSet(data);
    localStorage.setItem("translationEdits", JSON.stringify(data));
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle textAlign={"center"}>Save Session?</DialogTitle>

      {sessionData && sessionData.length > 0 ? (
        <Box
          sx={{
            padding: "10px",
          }}
        >
          <Typography>Save these changes:</Typography>

          <Box
            sx={{
              border: "1px solid black",

              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <List sx={{ pt: 0 }}>
              {sessionData.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderRadius: "5px",
                  }}
                >
                  <Typography color={item.color}> {item.label}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
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
            <Button variant='contained' onClick={updateDB}>
              Save
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            padding: "10px",
          }}
        >
          No changes
        </Box>
      )}
    </Dialog>
  );
}
