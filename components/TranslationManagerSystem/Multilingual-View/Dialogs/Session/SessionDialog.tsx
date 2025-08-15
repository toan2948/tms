import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { insertNewTranslationKeys } from "@/utils/languages/addNewKey";
import {
  fetchAllTranslationFiles,
  updateChangedKeys,
} from "@/utils/languages/dataFunctions";
import {
  findParentIdsToRootByFullKeyPath,
  findSelectedKey,
  formatEmptyNewKeysForSessionDialog,
  formatSessionDialogData,
  processedChangedKeys,
} from "@/utils/languages/processData";
import { Box, Button, Dialog, DialogTitle, Stack } from "@mui/material";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { MissingTranslationKeysDialog } from "./MissingTranslationKeyDialog";
import SessionKeyList from "./SessionKeyList";
export interface SessionDialogProps {
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
}

export function SessionDialog({ open, onClose }: SessionDialogProps) {
  const [
    openMissingTranslationKeysDialog,
    setOpenMissingTranslationKeysDialog,
  ] = useState(false);
  const { filesInfo, setFilesInfo } = useAllKeyFileStore();
  const { setSelectedTreeKey, setParentIDs, setFileName } = useTreeKeyStore();
  const { setSeeAllChanges } = useOtherStateStore();

  const {
    changedKeys,
    editedKeys,
    NotEmptyNewKeys,
    missingTranslationKeys,
    NotMissingTranslationKeys,
  } = useMemo(() => processedChangedKeys(filesInfo), [filesInfo]);

  //formatting data for displaying
  const editedKeysSessionFormat = useMemo(
    () =>
      formatSessionDialogData(
        editedKeys,
        (e) => (!e.isNew && e.old_segment !== e.key_path_segment) || e.isChanged
      ),
    [editedKeys]
  );
  const NotEmptyNewKeysSessionFormat = useMemo(
    () =>
      formatSessionDialogData(NotEmptyNewKeys, (e) => (e.isNew ? true : false)),
    [NotEmptyNewKeys]
  );

  const emptyKeysSessionFormat = useMemo(
    () => formatEmptyNewKeysForSessionDialog(missingTranslationKeys),
    [missingTranslationKeys]
  );
  // New keys will be inserted into DB (all parent and their children keys)
  const newKeys = useMemo(
    () => NotMissingTranslationKeys.filter((key) => key.isNew),
    [NotMissingTranslationKeys]
  );

  //--

  //close the dialog
  const handleClose = () => {
    onClose(false);
  };

  const updateDB = async () => {
    if (emptyKeysSessionFormat.length > 0) {
      setOpenMissingTranslationKeysDialog(true); // Open dialog if there are missing translation keys
      return;
    }
    await updateChangedKeys(editedKeys);
    await insertNewTranslationKeys(newKeys); // Insert new keys into the DB
    onClose(false);
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
    setSelectedTreeKey(findSelectedKey(IDs[0], filename, filesInfo));
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
        data={emptyKeysSessionFormat}
      />
      <Box
        sx={{
          padding: "10px",
        }}
      >
        {emptyKeysSessionFormat && emptyKeysSessionFormat.length > 0 && (
          <SessionKeyList
            keyStatus='Missing translation values'
            formattedKeyList={emptyKeysSessionFormat}
            handleClick={handleClick}
          />
        )}

        {editedKeysSessionFormat && editedKeysSessionFormat.length > 0 && (
          <SessionKeyList
            keyStatus='Edited Keys'
            formattedKeyList={editedKeysSessionFormat}
            handleClick={handleClick}
          />
        )}
        {NotEmptyNewKeysSessionFormat &&
          NotEmptyNewKeysSessionFormat.length > 0 && (
            <SessionKeyList
              keyStatus='New Keys'
              formattedKeyList={NotEmptyNewKeysSessionFormat}
              handleClick={handleClick}
            />
          )}
        {changedKeys.length > 0 ? (
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
