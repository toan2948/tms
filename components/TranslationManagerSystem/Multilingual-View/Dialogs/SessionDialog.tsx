import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { insertNewTranslationKeys } from "@/utils/languages/addNewKey";
import {
  fetchAllTranslationFiles,
  updateChangedKeys,
} from "@/utils/languages/dataFunctions";
import {
  filterTranslationKeys,
  findParentIdsToRootByFullKeyPath,
  findSelectedKey,
  formatSessionDialogData,
} from "@/utils/languages/processData";
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
import { Dispatch, SetStateAction, useMemo } from "react";
import { toast } from "react-toastify";
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
  const { filesInfo, setFilesInfo } = useAllKeyFileStore();

  const { setSelectedTreeKey, DBkeys } = useTreeKeyStore();

  const { setParentIDs } = useTreeKeyStore();
  const { setFileName } = useFileNameStore();
  const changedKeys = useMemo(
    () => filterTranslationKeys(filesInfo),
    [filesInfo]
  );

  const editedKeys = useMemo(
    () => changedKeys.filter((key) => !key.isNew),
    [changedKeys]
  );

  // console.log("changedKeys", changedKeys);

  const newKeys = useMemo(
    () => changedKeys.filter((key) => key.isNew),
    [changedKeys]
  );

  const newLowestLevelKeys = changedKeys.filter(
    (key) => key.isNew && !key.has_children //reduce the key to english language only
  );

  const editedKeysSessionFormat = formatSessionDialogData(
    editedKeys,
    (e) => !e.isNew
  );
  const newKeysSessionFormat = formatSessionDialogData(
    newLowestLevelKeys,
    (e) => (e.isNew ? true : false)
  );

  // console.log("newKeysSessionFormat", newKeysSessionFormat);
  const handleClose = () => {
    onClose(false);
  };

  const updateDB = async () => {
    await updateChangedKeys(editedKeys);
    await insertNewTranslationKeys(newKeys); // Insert new keys into the DB
    onClose(false);
    const data = await fetchAllTranslationFiles(); // Fetch updated data from the DB
    setFilesInfo(data);
    localStorage.setItem("translationEdits", JSON.stringify(data));
    toast.success("Saved to DB!");
  };

  // This function can be used to navigate to the specific key in the translation editor
  const handleClick = (fullKeyPath: string, filename: string) => {
    setFileName(filename); //to build a tree corresponding to the filename
    const IDs = findParentIdsToRootByFullKeyPath(
      fullKeyPath,
      filesInfo,
      filename
    );
    setSelectedTreeKey(findSelectedKey(IDs[0], filename, DBkeys));
    setParentIDs(Array.isArray(IDs) ? IDs.slice(1).reverse() : []);
    setSeeAllChanges(false); // Close the session dialog and switch to the tree view
    handleClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle textAlign={"center"}>Session Changes</DialogTitle>

      <Box
        sx={{
          padding: "10px",
        }}
      >
        {editedKeysSessionFormat && editedKeysSessionFormat.length > 0 && (
          <>
            <Typography>Changes on key values:</Typography>

            <Box
              sx={{
                border: "1px solid black",

                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <List sx={{ pt: 0 }}>
                {editedKeysSessionFormat.map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      handleClick(item.fullKey, item.filename);
                    }}
                  >
                    <Typography color={item.color}> {item.label}</Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}
        {newKeysSessionFormat && newKeysSessionFormat.length > 0 && (
          <>
            <Typography>New keys:</Typography>

            <Box
              sx={{
                border: "1px solid black",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <List sx={{ pt: 0 }}>
                {newKeysSessionFormat.map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      handleClick(item.fullKey, item.filename);
                    }}
                  >
                    <Typography color={item.color}> {item.label}</Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}
        {editedKeysSessionFormat.length > 0 ||
        newKeysSessionFormat.length > 0 ? (
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
              Save Changes
            </Button>
          </Stack>
        ) : (
          <Box
            sx={{
              padding: "10px",
            }}
          >
            No changes
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
