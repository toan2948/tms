import { Typo1224 } from "@/components/ui/StyledElementPaymentDetail";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { KeyState, TranslationTreeKey } from "@/types/translation";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useState } from "react";

export const AddKeyField = () => {
  const { fileNameState } = useFileNameStore();
  const { addKeysToFilesInfo } = useEditAllFileStore();
  const { DBkeys, addKeysToTree } = useTreeKeyStore();
  const [newKeyState, setNewKeyState] = useState("");
  const [isKeyExisted, setIsKeyExisted] = useState(false);
  const [isNewKeyAdded, setIsNewKeyAdded] = useState(false);
  const [openAddKeyField, setOpenAddKeyField] = useState(false);

  const handleAddKey = async () => {
    const trimmedKey = newKeyState.trim();
    if (!trimmedKey) return;

    const existingKeys =
      DBkeys.find((e) => e.fileName === fileNameState)?.keys || [];
    const keyExists = existingKeys.some((e) => e.full_key_path === trimmedKey);

    if (keyExists) {
      setIsKeyExisted(true);
      setTimeout(() => setIsKeyExisted(false), 4000);
      return;
    }

    const keysToAdd: TranslationTreeKey[] = [];
    const fileInfoUpdates: KeyState[] = [];

    const keySegments = trimmedKey.split(".");
    let parentID: string | null = null;

    // Add missing parent keys (from root down to parent of leaf)
    for (let i = 0; i < keySegments.length - 1; i++) {
      const currentPath = keySegments.slice(0, i + 1).join(".");
      const exists = existingKeys.some((k) => k.full_key_path === currentPath);
      if (!exists) {
        const newParent: TranslationTreeKey = {
          id: crypto.randomUUID(),
          full_key_path: currentPath,
          has_children: true,
          file_id: fileNameState,
          parent_id: parentID,
          level: i,
          key_path_segment: keySegments[i],
        };

        keysToAdd.push(newParent);

        fileInfoUpdates.push({
          fullKeyPath: currentPath,
          id: newParent.id,
          isChanged: true,
          value: null,
          version: 1,
          last_edited_at: null,
          has_children: true,
          parent_id: parentID,
          isNew: true,
        });

        parentID = newParent.id;
      } else {
        // If it exists, fetch its ID as parent
        parentID =
          existingKeys.find((k) => k.full_key_path === currentPath)?.id || null;
      }
    }

    // Add final leaf key
    const newLeaf: TranslationTreeKey = {
      id: crypto.randomUUID(),
      full_key_path: trimmedKey,
      has_children: false,
      file_id: fileNameState,
      parent_id: parentID,
      level: keySegments.length - 1,
      key_path_segment: keySegments[keySegments.length - 1],
    };

    keysToAdd.push(newLeaf);

    fileInfoUpdates.push({
      fullKeyPath: trimmedKey,
      id: newLeaf.id,
      isChanged: true,
      value: null,
      version: 1,
      last_edited_at: null,
      has_children: false,
      parent_id: parentID,
      isNew: true,
    });

    // ✅ Use the batch store actions
    addKeysToTree(keysToAdd, fileNameState);
    addKeysToFilesInfo(fileInfoUpdates, fileNameState);

    setNewKeyState("");
    setIsNewKeyAdded(true);
    setTimeout(() => setIsNewKeyAdded(false), 4000);
  };

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
