"use client";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { useViewStore } from "@/store/useViewStore";
import { KeyState } from "@/types/translation";
import {
  checkDuplicateKeyName,
  filterTranslationKeys,
  getTranslationKeys,
} from "@/utils/languages/processData";
import {
  Box,
  Button,
  InputAdornment,
  List,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { DeleteKeyDialog } from "../../Dialogs/DeleteKeyDialog";
import TranslationField from "./TranslationField";

const TranslationValueList = () => {
  const { selectedTreeKey, DBkeys, updateKeyPathSegment } = useTreeKeyStore();
  const [error, setError] = useState(false);
  const [showHelperText, setShowHelperText] = useState(false);
  const [openDeleteKeyDialog, setOpenDeleteKeyDialog] = useState(false);
  const [NameIsDuplicated, setNameIsDuplicated] = useState(false);

  const [openEditKeyField, setOpenEditKeyField] = useState(false);
  const { fileNameState } = useFileNameStore();

  const [valuesState, setValuesState] = React.useState<KeyState[]>([]);

  const { filesInfo, updateKeyPathSegmentInFiles } = useAllKeyFileStore();
  const [newKeyName, setNewKeyName] = useState(
    selectedTreeKey?.key_path_segment || ""
  );
  const { sourceLanguage, targetLanguage, multiViewState } = useViewStore();

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
      DBkeys,
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
    updateKeyPathSegment(selectedTreeKey.id, trimmedKey, fileNameState);
    updateKeyPathSegmentInFiles(selectedTreeKey.full_key_path, trimmedKey);
    // setSelectedTreeKey({ ...selectedTreeKey, key_path_segment: trimmedKey });
  };

  //this changedKeys is used as a dependent factor in useEffect to update valuesState when the state FilesInfo is changed
  //filesInfo can not be used directly in useEffect because it will cause a bug as filesInfo is a dynamic state that can change the size of dependencies array of the useEffect
  const changedKeys = useMemo(
    () => filterTranslationKeys(filesInfo),
    [filesInfo]
  );

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

  useEffect(() => {
    console.log("valueState changed", valuesState);
  }, [valuesState, selectedTreeKey]);
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
            <Typo1424 weight={600}>
              Key to translate: {selectedTreeKey?.key_path_segment}
            </Typo1424>
            <Typo1424 weight={500}>
              {selectedTreeKey?.notes || "No notes available"}
            </Typo1424>
          </Box>

          <Stack direction={"row"}>
            <Button
              variant={"outlined"}
              sx={{
                marginRight: "10px",
                marginLeft: "10px",
                color: "red",
                borderColor: "red", // <-- this is key for the outline
                "&:hover": {
                  backgroundColor: "rgba(255, 0, 0, 0.04)", // subtle red on hover
                  borderColor: "red",
                },
              }}
              onClick={() => setOpenDeleteKeyDialog(true)}
            >
              Delete
            </Button>
            <Stack
              direction={"row"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              {!openEditKeyField && (
                <Button
                  sx={{ marginRight: "10px" }}
                  variant={"outlined"}
                  onClick={() => setOpenEditKeyField(true)}
                >
                  Edit Key Name
                </Button>
              )}
              <TextField
                onChange={(e) => setNewKeyName(e.target.value)}
                variant='outlined'
                value={newKeyName}
                error={error}
                helperText={
                  showHelperText
                    ? NameIsDuplicated
                      ? "Key name already exists in this parent"
                      : "Only letters, numbers, and underscore (_) allowed"
                    : ""
                }
                sx={{
                  display: openEditKeyField ? "block" : "none", // ✅ hide instead of unmount
                  "& .MuiOutlinedInput-root": {
                    padding: "0px 0px 0px 5px",
                    height: 40,
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "0 8px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center", // ensures text vertically aligns
                  },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end' sx={{ p: 0 }}>
                        <Button
                          onClick={handleEditKeyName}
                          disableElevation
                          sx={{
                            borderLeft: "1px solid rgba(0, 0, 0, 0.23)",
                            borderRadius: 0,
                            minWidth: 50,
                            height: 40,
                            m: 0,
                            p: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          Save
                        </Button>
                      </InputAdornment>
                    ),
                  },
                }}
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
