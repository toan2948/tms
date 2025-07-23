import { Typo1224 } from "@/components/ui/StyledElementPaymentDetail";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { KeyState, TranslationTreeKey } from "@/types/translation";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useState } from "react";

export const AddKeyField = () => {
  const { fileNameState } = useFileNameStore();
  const { addKeysToFilesInfo, filesInfo } = useEditAllFileStore();
  const { addKeysToTree } = useTreeKeyStore();
  const [newKeyState, setNewKeyState] = useState("");
  const [isKeyExisted, setIsKeyExisted] = useState(false);
  const [isNewKeyAdded, setIsNewKeyAdded] = useState(false);
  const [openAddKeyField, setOpenAddKeyField] = useState(false);
  const [error, setError] = useState(false);
  const [showHelperText, setShowHelperText] = useState(false);

  // await addKeyToAllFilesWithSameName({
  //   filename: fileNameState,
  //   fullKeyPath: newKeyState,
  // })
  //   .then(() => {
  //     console.log(`Key "${newKeyState}" added successfully.`);
  //   })
  //   .catch((error) => {
  //     console.error("Error adding key:", error);
  //   });

  const handleAddKey = async () => {
    const trimmedKey = newKeyState.trim();
    const isValid = /^[a-zA-Z0-9._]*$/.test(trimmedKey);
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

    const matchingFiles = filesInfo.filter(
      (entry) => entry.fileName === fileNameState
    );
    // console.log("Matching files:", matchingFiles);

    let duplicateFound = false;

    // Pre-check: prevent duplicate in any of the files
    for (const file of matchingFiles) {
      const exists = file.keys.some((key) => key.fullKeyPath === trimmedKey);
      if (exists) {
        duplicateFound = true;
        break;
      }
    }

    if (duplicateFound) {
      setIsKeyExisted(true);
      setTimeout(() => setIsKeyExisted(false), 4000);
      return;
    }

    const keySegments = trimmedKey.split(".");

    for (const file of matchingFiles) {
      const keysToAdd: TranslationTreeKey[] = [];
      const fileInfoUpdates: KeyState[] = [];

      let parentID: string | null = null;
      const existingKeys = file.keys;

      // Handle missing parent segments
      for (let i = 0; i < keySegments.length - 1; i++) {
        const currentPath = keySegments.slice(0, i + 1).join(".");
        const existingParent = existingKeys.find(
          (k) => k.fullKeyPath === currentPath
        );
        if (!existingParent) {
          const newParentId = crypto.randomUUID();
          const newParent: TranslationTreeKey = {
            id: newParentId,
            full_key_path: currentPath,
            has_children: true,
            file_id: file.fileName, // Use filename, not lang-specific
            parent_id: parentID,
            level: i,
            notes: null,
            key_path_segment: keySegments[i],
          };

          keysToAdd.push(newParent);

          fileInfoUpdates.push({
            fullKeyPath: currentPath,
            id: newParentId,
            isChanged: true,
            value: null,
            version: 1,
            last_edited_at: null,
            has_children: true,
            parent_id: parentID,
            isNew: true,
            notes: null,
            old_value: null,
          });

          parentID = newParentId;
        } else {
          parentID = existingParent.id;
        }
      }

      // Add final leaf key
      const leafId = crypto.randomUUID();
      const newLeaf: TranslationTreeKey = {
        id: leafId,
        notes: null,
        full_key_path: trimmedKey,
        has_children: false,
        file_id: file.fileName,
        parent_id: parentID,
        level: keySegments.length - 1,
        key_path_segment: keySegments[keySegments.length - 1],
      };

      keysToAdd.push(newLeaf);

      fileInfoUpdates.push({
        fullKeyPath: trimmedKey,
        id: leafId,
        isChanged: true,
        value: null,
        version: 1,
        last_edited_at: null,
        has_children: false,
        parent_id: parentID,
        isNew: true,
        notes: null,
        old_value: null,
      });

      // Batch add to store
      addKeysToTree(keysToAdd, file.fileName, file.language_code);
      addKeysToFilesInfo(fileInfoUpdates, file.fileName, file.language_code);
    }

    // Reset UI
    setNewKeyState("");
    setIsNewKeyAdded(true);
    setTimeout(() => setIsNewKeyAdded(false), 4000);
  };

  return (
    <Stack direction={"column"}>
      <Stack direction={"row"} justifyContent={"center"} alignItems={"center"}>
        <Button
          sx={{ marginRight: "10px" }}
          onClick={() => setOpenAddKeyField(true)}
          variant='contained'
        >
          Add Key
        </Button>
        <>
          <TextField
            onChange={(e) => setNewKeyState(e.target.value)}
            variant='outlined'
            value={newKeyState}
            error={error}
            helperText={
              showHelperText
                ? "Only letters, numbers, dot (.) and underscore (_) allowed"
                : ""
            }
            sx={{
              display: openAddKeyField ? "block" : "none", // ✅ hide instead of unmount
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
                startAdornment: (
                  <InputAdornment position='start'>
                    {fileNameState}:
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end' sx={{ p: 0 }}>
                    <Button
                      onClick={handleAddKey}
                      disableElevation
                      sx={{
                        borderLeft: "1px solid rgba(0, 0, 0, 0.23)",
                        borderRadius: 0,
                        minWidth: 40,
                        height: 40,
                        m: 0,
                        p: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant='contained'
            onClick={() => setOpenAddKeyField(false)}
            sx={{
              marginLeft: "10px",
              display: openAddKeyField ? "block" : "none", // ✅ hide instead of unmount
            }}
          >
            Cancel
          </Button>
        </>
      </Stack>
      <Box alignSelf={"center"}>
        {isKeyExisted && (
          <Typo1224 style={{ color: "red", fontSize: "12px" }}>
            Key {newKeyState} already exists!
          </Typo1224>
        )}
        {isNewKeyAdded && (
          <Typo1224 style={{ color: "green", fontSize: "12px" }}>
            Key {newKeyState} is added!
          </Typo1224>
        )}
      </Box>
    </Stack>
  );
};
