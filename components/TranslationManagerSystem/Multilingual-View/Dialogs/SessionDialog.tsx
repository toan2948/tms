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
  findParentIdsToRootByFullKeyPath,
  formatSessionDialogData,
} from "@/utils/languages/processData";
import {
  fetchAllTranslationFiles,
  updateChangedKeys,
} from "@/utils/languages/dataFunctions";
import { toast } from "react-toastify";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
export interface SessionDialogProps {
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  setSeeAllChanges: Dispatch<SetStateAction<boolean>>;
}

export function SessionDialog({
  open,
  onClose,
  setSeeAllChanges,
}: SessionDialogProps) {
  const { filesInfo, setFilesInfo, DBFilesInfo, setDBFilesInfo } =
    useEditAllFileStore();

  const { setFocusedKey, setParentIDs } = useTreeKeyStore();
  const { changeFileName } = useFileNameStore();
  const changedKeys = filterTranslationKeys(filesInfo, DBFilesInfo);
  const sessionData = formatSessionDialogData(changedKeys);

  // console.log("changedKeys sessiondialog", changedKeys);
  const handleClose = () => {
    onClose(false);
  };

  const updateDB = async () => {
    await updateChangedKeys(changedKeys);
    onClose(false);
    const data = await fetchAllTranslationFiles();
    setFilesInfo(data);
    setDBFilesInfo(data);
    localStorage.setItem("translationEdits", JSON.stringify(data));
    toast.success("Saved to DB!");
  };

  const handleClick = (fullKeyPath: string, filename: string) => {
    // This function can be used to navigate to the specific key in the translation editor

    changeFileName(filename); //to build a tree corresponding to the filename
    const IDs = findParentIdsToRootByFullKeyPath(
      fullKeyPath,
      DBFilesInfo,
      "en",
      filename
    );
    setFocusedKey(IDs[0]);
    const parentIDs = Array.isArray(IDs) ? IDs.slice(1).reverse() : [];
    setParentIDs(parentIDs);
    setSeeAllChanges(false); // Close the session dialog and switch to the tree view
    // console.log("Parent IDs :", parentIDs);
    handleClose();
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
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleClick(item.fullKeyPath, item.filename);
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
