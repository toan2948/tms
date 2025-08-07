"use client";
import EditableTextFieldWithSave from "@/components/ui/EditTextField";
import RedOutlineButton from "@/components/ui/RedOutlineButton";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { useUserStore } from "@/store/useUserStore";
import { useViewStore } from "@/store/useViewStore";
import { KeyState } from "@/types/keyType";
import { isDevOrAdmin } from "@/utils/languages/login";
import {
  checkDuplicateKeyName,
  filterChangedKeys,
  getTranslationKeys,
} from "@/utils/languages/processData";
import { Box, Button, List, Stack } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { DeleteKeyDialog } from "../../Dialogs/Delete/DeleteKeyDialog";
import Note from "./Note";
import TranslationField from "./TranslationField";
const TranslationValueList = () => {
  const { selectedTreeKey } = useTreeKeyStore();
  const { filesInfo, updateKeyPathSegmentInFiles } = useAllKeyFileStore();
  const { sourceLanguage, targetLanguage, multiViewState } = useViewStore();
  const { user } = useUserStore();
  const [error, setError] = useState(false);
  const [showHelperText, setShowHelperText] = useState(false);
  const [openDeleteKeyDialog, setOpenDeleteKeyDialog] = useState(false);
  const [NameIsDuplicated, setNameIsDuplicated] = useState(false);
  const [openEditKeyField, setOpenEditKeyField] = useState(false);
  const { fileNameState } = useOtherStateStore();
  const [valuesState, setValuesState] = React.useState<KeyState[]>([]);

  const [newKeyName, setNewKeyName] = useState(
    selectedTreeKey?.key_path_segment || ""
  );

  const handleEditKeyName = () => {
    if (selectedTreeKey === null) return;
    const trimmedKey = newKeyName.trim();
    const isValid = /^[a-zA-Z0-9_]*$/.test(trimmedKey);
    if (!trimmedKey) return;
    if (!isValid) {
      setError(true);
      setShowHelperText(true);
      setTimeout(() => {
        setShowHelperText(false);
        setError(false);
      }, 3000);
      return;
    }
    // Check if the key already exists in the current file
    const isDuplicatedName = checkDuplicateKeyName(
      trimmedKey,
      selectedTreeKey,
      filesInfo,
      fileNameState
    );

    if (isDuplicatedName) {
      setError(true);
      setNameIsDuplicated(true);
      setShowHelperText(true);
      setTimeout(() => {
        setShowHelperText(false);
        setError(false);
      }, 3000);
      return;
    }
    updateKeyPathSegmentInFiles(
      selectedTreeKey.full_key_path,
      trimmedKey,
      fileNameState
    );
    setOpenEditKeyField(false); // Close the edit field after saving
  };

  //this changedKeys is used as a dependent factor in useEffect to update valuesState when the state FilesInfo is changed
  //filesInfo can not be used directly in useEffect because it will cause a bug as filesInfo is a dynamic state that can change the size of dependencies array of the useEffect
  const changedKeys = useMemo(() => filterChangedKeys(filesInfo), [filesInfo]);

  useEffect(() => {
    setNewKeyName(selectedTreeKey?.key_path_segment || ""); //set the initial value for the edit field
  }, [selectedTreeKey]);

  useEffect(() => {
    const allValueStates = getTranslationKeys(
      fileNameState,
      selectedTreeKey,
      filesInfo
    );
    if (sourceLanguage && targetLanguage && !multiViewState) {
      setValuesState(
        allValueStates.filter(
          (e) =>
            e.language_name.toLowerCase() === sourceLanguage.toLowerCase() ||
            e.language_name.toLowerCase() === targetLanguage.toLowerCase()
        )
      );
    } else {
      setValuesState(allValueStates);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fileNameState,
    selectedTreeKey,
    changedKeys,
    sourceLanguage,
    targetLanguage,
    multiViewState,
  ]); //valuesState in this condition will cause infinite loop

  return (
    <>
      <DeleteKeyDialog
        open={openDeleteKeyDialog}
        setOpenDeleteKeyDialog={setOpenDeleteKeyDialog}
      />
      {selectedTreeKey && (
        <Stack
          width={"100%"}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          sx={{
            padding: "10px 10px 0 10px",
          }}
        >
          <Box>
            <Stack direction={"column"}>
              <Box>
                <Typo1424 weight={600}>
                  Key to translate: {selectedTreeKey?.key_path_segment}
                </Typo1424>
              </Box>
              {selectedTreeKey.old_full_key_path !==
                selectedTreeKey.full_key_path &&
                selectedTreeKey.key_path_segment !==
                  selectedTreeKey.old_segment && (
                  <Box>
                    <Typo1424 color='red'>
                      Old key name: {selectedTreeKey?.old_full_key_path}
                    </Typo1424>
                  </Box>
                )}
            </Stack>
          </Box>
          <Note />

          <Stack direction={"row"}>
            {isDevOrAdmin(user?.role) && (
              <RedOutlineButton onClick={() => setOpenDeleteKeyDialog(true)}>
                Delete Key
              </RedOutlineButton>
            )}
            <Stack
              direction={"row"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              {isDevOrAdmin(user?.role) && !openEditKeyField && (
                <Button
                  sx={{ marginRight: "10px" }}
                  variant={"outlined"}
                  onClick={() => setOpenEditKeyField(true)}
                >
                  Edit Key Name
                </Button>
              )}
              <EditableTextFieldWithSave
                value={newKeyName}
                onChange={setNewKeyName}
                onSave={handleEditKeyName}
                show={openEditKeyField}
                error={error}
                helperText={
                  showHelperText
                    ? NameIsDuplicated
                      ? "Key name already exists in this parent"
                      : "Only letters, numbers, and underscore (_) allowed"
                    : ""
                }
              />

              <Button
                variant='contained'
                onClick={() => setOpenEditKeyField(false)}
                sx={{
                  marginLeft: "10px",
                  display: openEditKeyField ? "block" : "none", // ✅ hide instead of unmount
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Stack>
      )}
      {!selectedTreeKey?.has_children && (
        <Stack direction={"row"} width={"100%"} sx={{ overflowY: "scroll" }}>
          <List sx={{ width: "100%" }}>
            {/* //todo: note- if key= e.key, there will be an absurd rendering */}

            {valuesState.map((e, index) => (
              <TranslationField index={index} key={index} data={e} />
            ))}
          </List>
        </Stack>
      )}
    </>
  );
};

export default TranslationValueList;
