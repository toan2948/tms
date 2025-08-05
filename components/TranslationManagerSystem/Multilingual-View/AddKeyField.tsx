import { Typo1224 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { KeyState } from "@/types/keyType";
import {
  findParentIdsToRootByFullKeyPath,
  findSelectedKey,
} from "@/utils/languages/processData";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
export const AddKeyField = () => {
  const { fileNameState } = useOtherStateStore();
  const { addKeysToFilesInfo, filesInfo, DBkeys } = useAllKeyFileStore();
  const { setSelectedTreeKey, setParentIDs, parentIDs } = useTreeKeyStore();
  const [newKeyState, setNewKeyState] = useState("");
  const [isNewKeyAdded, setIsNewKeyAdded] = useState(false);
  const [openAddKeyField, setOpenAddKeyField] = useState(false);
  const [error, setError] = useState(false);
  const [showHelperText, setShowHelperText] = useState("");

  const handleAddKey = useCallback(async () => {
    const trimmedKey = newKeyState.trim();
    const isValid = /^[a-zA-Z0-9._]*$/.test(trimmedKey);

    // const isLevelLowerAdded =
    if (!trimmedKey) return;
    if (!isValid) {
      setError(true);
      setShowHelperText(
        "Only letters, numbers, dot (.) and underscore (_) allowed"
      );
      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }

    const matchingFiles = filesInfo.filter(
      (entry) => entry.fileName === fileNameState
    );

    let duplicateFound = false;

    // Pre-check: prevent duplicate in any of the files
    for (const file of matchingFiles) {
      const exists = file.keys.some((key) => key.full_key_path === trimmedKey);
      if (exists) {
        duplicateFound = true;
        break;
      }
    }

    if (duplicateFound) {
      setError(true);
      setShowHelperText(`Key "${trimmedKey}" already exists!`);
      setTimeout(() => setError(false), 4000);
      return;
    }

    const keySegments = trimmedKey.split(".");
    const parentPath = keySegments.slice(0, -1).join(".");

    // Validate parent in all matching files
    for (const file of matchingFiles) {
      if (parentPath) {
        const parentKey = file.keys.find(
          (key) => key.full_key_path === parentPath
        );
        if (parentKey && parentKey.has_children === false) {
          // ❌ Parent exists but is a leaf node (invalid)
          setError(true);
          setShowHelperText("Parent key is already a leaf node!");
          setTimeout(() => setError(false), 4000);
          return;
        }
      }
    }

    const fileInfoUpdates: KeyState[] = [];
    for (const file of matchingFiles) {
      let parentID: string | null = null;
      const existingKeys = file.keys;

      // Handle missing parent segments
      for (let i = 0; i < keySegments.length - 1; i++) {
        const currentPath = keySegments.slice(0, i + 1).join(".");
        const existingParent = existingKeys.find(
          (k) => k.full_key_path === currentPath
        );
        if (!existingParent) {
          const newParentId = uuidv4();

          fileInfoUpdates.push({
            full_key_path: currentPath,
            id: newParentId,
            isChanged: false,
            value: null,
            version: 0,
            has_children: true,
            parent_id: parentID,
            isNew: true,
            notes: null,
            old_value: null,
            old_version: 0,
            key_path_segment: keySegments[i],
            old_segment: keySegments[i],
            old_full_key_path: currentPath,
            level: i,
            file_id: file.file_id,
            language_code: file.language_code,
            language_name: file.language_name,
          });

          parentID = newParentId;
        } else {
          parentID = existingParent.id;
        }
      }

      // Add final leaf key
      const leafId = uuidv4();

      fileInfoUpdates.push({
        full_key_path: trimmedKey,
        id: leafId,
        isChanged: false,
        value: null,
        version: 0,
        has_children: false,
        parent_id: parentID,
        isNew: true,
        notes: null,
        old_value: null,
        old_version: 0,
        key_path_segment: keySegments[keySegments.length - 1],
        old_segment: keySegments[keySegments.length - 1],
        old_full_key_path: trimmedKey,
        level: keySegments.length - 1,
        file_id: file.file_id,
        language_code: file.language_code,
        language_name: file.language_name,
      });

      // Batch add to store
      addKeysToFilesInfo(fileInfoUpdates, file.fileName, file.language_code);
    }

    // setNewKeyState("");
    setIsNewKeyAdded(true);
    setTimeout(() => setIsNewKeyAdded(false), 4000);
  }, [newKeyState, filesInfo, fileNameState]);

  // useEffect(() => {
  //   console.log("selectedTreeKey", selectedTreeKey, parentIDs);
  // }, [parentIDs]);

  useEffect(() => {
    //selectedKeys and parentIds should be set in useEffect, so that the tree can expanded appropriately
    const IDs = findParentIdsToRootByFullKeyPath(
      newKeyState.trim(),
      filesInfo,
      fileNameState
    );
    if (newKeyState.trim()) {
      //prevent filesInfo changes in another component, which make this comp re-render and selectedKey will be null, because IDs is null
      setSelectedTreeKey(findSelectedKey(IDs[0], fileNameState, DBkeys));

      setParentIDs(
        parentIDs.concat(Array.isArray(IDs) ? IDs.slice(1).reverse() : [])
      );
    }
    setTimeout(() => {
      setNewKeyState("");
    }, 1000); // Clear the input after a short delay
  }, [filesInfo]);

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
            helperText={showHelperText}
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
        {isNewKeyAdded && (
          <Typo1224 style={{ color: "green", fontSize: "12px" }}>
            Key {newKeyState} is added!
          </Typo1224>
        )}
      </Box>
    </Stack>
  );
};
