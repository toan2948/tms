import { Typo1224 } from "@/components/ui/StyledElementPaymentDetail";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { TranslationTreeKey } from "@/types/translation";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { useState } from "react";

export const AddKeyField = () => {
  const { fileNameState } = useFileNameStore();
  const { addKEyToFilesInfo } = useEditAllFileStore();
  const { DBkeys, addKeyToTree } = useTreeKeyStore();
  const [newKeyState, setNewKeyState] = useState("");
  const [isKeyExisted, setIsKeyExisted] = useState(false);
  const [isNewKeyAdded, setIsNewKeyAdded] = useState(false);
  const [openAddKeyField, setOpenAddKeyField] = useState(false);

  const handleAddKey = async () => {
    //check if newKeyState already exists in DBKeys
    const trimmedNewKeyState = newKeyState.trim();
    const keys = DBkeys.find(
      (e: { fileName: string; keys: TranslationTreeKey[] }) =>
        e.fileName === fileNameState
    )?.keys;
    const isKeyExists = keys?.find(
      (e) => e.full_key_path === trimmedNewKeyState
    )?.full_key_path;
    if (isKeyExists) {
      setIsKeyExisted(true);
      setTimeout(() => {
        setIsKeyExisted(false);
      }, 4000);
      console.log(`Key "${trimmedNewKeyState}" already exists.`);
    } else {
      setIsKeyExisted(false);
      const keySegments = trimmedNewKeyState.split(".");
      const level = keySegments.length - 1;
      const keyPathSegment = keySegments[keySegments.length - 1];

      const parentKey = keySegments.slice(0, -1).join(".") || null;
      const parentID =
        DBkeys.find((e) => e.fileName === fileNameState)?.keys.find(
          (e) => e.full_key_path === parentKey
        )?.id || null;

      const newKey = {
        id: crypto.randomUUID(),
        full_key_path: trimmedNewKeyState,
        value: "",
        has_children: false,
        file_id: fileNameState,
        parent_id: parentID,
        level,
        key_path_segment: keyPathSegment,
      };
      const newKeyForFileInfo = {
        fullKeyPath: trimmedNewKeyState,
        id: newKey.id,
        isChanged: true,
        value: newKey.value,
        version: 1,
        last_edited_at: null,
        has_children: false,
        parent_id: newKey.parent_id,
        isNew: true, // Indicates that this key is newly added
      };
      addKeyToTree(newKey, fileNameState);
      addKEyToFilesInfo(newKeyForFileInfo, fileNameState);
      setIsNewKeyAdded(true);
      setTimeout(() => {
        setIsNewKeyAdded(false);
        setNewKeyState("");
      }, 4000);
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
    }
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
