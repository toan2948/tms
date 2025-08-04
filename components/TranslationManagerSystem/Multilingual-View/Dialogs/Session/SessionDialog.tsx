import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { insertNewTranslationKeys } from "@/utils/languages/addNewKey";
import {
  fetchAllTranslationFiles,
  updateChangedKeys,
} from "@/utils/languages/dataFunctions";
import {
  filterChangedKeys,
  findParentIdsToRootByFullKeyPath,
  findSelectedKey,
  formatEmptyNewKeysForSessionDialog,
  formatSessionDialogData,
  groupKeysByFullPath,
} from "@/utils/languages/processData";
import { Box, Button, Dialog, DialogTitle, Stack } from "@mui/material";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { MissingTranslationKeysDialog } from "./MissingTranslationKeyDialog";
import SessionKeyList from "./SessionKeyList";
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
  const [
    openMissingTranslationKeysDialog,
    setOpenMissingTranslationKeysDialog,
  ] = useState(false);
  const { filesInfo, setFilesInfo } = useAllKeyFileStore();

  const { setSelectedTreeKey, DBkeys } = useTreeKeyStore();

  const { setParentIDs } = useTreeKeyStore();
  const { setFileName } = useOtherStateStore();
  const changedKeys = useMemo(() => filterChangedKeys(filesInfo), [filesInfo]);

  // console.log("changedKeys", changedKeys);

  const editedKeys = useMemo(
    () => changedKeys.filter((key) => !key.isNew),
    [changedKeys]
  );

  // New keys will be inserted into DB
  const newKeys = useMemo(
    () => changedKeys.filter((key) => key.isNew),
    [changedKeys]
  );

  //the new keys are displayed in the session dialog
  const newLowestLevelKeys = useMemo(
    () =>
      changedKeys.filter(
        (key) => key.isNew && !key.has_children //reduce the key to english language only
      ),
    [changedKeys]
  );

  const groupedNewKeys = groupKeysByFullPath(newLowestLevelKeys);

  //the new keys are missing translations
  const emptyNewKeys = useMemo(
    () =>
      groupedNewKeys.filter((group) =>
        group.keys.every((key) => key.value === null || key.value === "")
      ),
    [groupedNewKeys]
  );

  //the new keys that have translations
  const NotEmptyNewKeys = useMemo(
    () =>
      groupedNewKeys
        .filter((group) =>
          group.keys.some((key) => key.value !== null && key.value !== "")
        )
        .map((group) => group.keys)
        .flat(),
    [groupedNewKeys]
  );

  //format data before displaying
  const editedKeysSessionFormat = useMemo(
    () => formatSessionDialogData(editedKeys, (e) => !e.isNew),
    [editedKeys]
  );
  const NotEmptyNewKeysSessionFormat = useMemo(
    () =>
      formatSessionDialogData(NotEmptyNewKeys, (e) => (e.isNew ? true : false)),
    [NotEmptyNewKeys]
  );

  const emptyNewKeysSessionFormat = useMemo(
    () => formatEmptyNewKeysForSessionDialog(emptyNewKeys),
    [emptyNewKeys]
  );

  //--

  const handleClose = () => {
    onClose(false);
  };

  const updateDB = async () => {
    if (emptyNewKeysSessionFormat.length > 0) {
      setOpenMissingTranslationKeysDialog(true); // Open dialog if there are missing translation keys
      return;
    }
    await updateChangedKeys(editedKeys);
    await insertNewTranslationKeys(newKeys); // Insert new keys into the DB
    onClose(false);
    localStorage.removeItem("translationEdits"); // Clear localStorage after saving to DB
    localStorage.removeItem("DBkeys"); // Clear DBkeys from localStorage
    const data = await fetchAllTranslationFiles(); // Fetch updated data from the DB
    setFilesInfo(data);
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
      <MissingTranslationKeysDialog
        open={openMissingTranslationKeysDialog}
        setOpen={setOpenMissingTranslationKeysDialog}
        data={emptyNewKeysSessionFormat}
      />
      <Box
        sx={{
          padding: "10px",
        }}
      >
        {emptyNewKeysSessionFormat && emptyNewKeysSessionFormat.length > 0 && (
          <SessionKeyList
            keyStatus='Missing translation keys'
            formattedKeyList={emptyNewKeysSessionFormat}
            handleClick={handleClick}
          />
        )}

        {editedKeysSessionFormat && editedKeysSessionFormat.length > 0 && (
          <SessionKeyList
            keyStatus='Changes on key values'
            formattedKeyList={editedKeysSessionFormat}
            handleClick={handleClick}
          />
        )}
        {NotEmptyNewKeysSessionFormat &&
          NotEmptyNewKeysSessionFormat.length > 0 && (
            <SessionKeyList
              keyStatus='New keys with translations'
              formattedKeyList={NotEmptyNewKeysSessionFormat}
              handleClick={handleClick}
            />
          )}
        {editedKeysSessionFormat.length > 0 || groupedNewKeys.length > 0 ? (
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
