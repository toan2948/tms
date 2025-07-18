import { Typo1224 } from "@/components/ui/StyledElementPaymentDetail";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";
import { TranslationTreeKey } from "@/types/translation";
import { TextField, InputAdornment, Button, Stack } from "@mui/material";
import { useState } from "react";

type AddKeyFieldProps = {
  setOpenAddKeyField: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AddKeyField = ({ setOpenAddKeyField }: AddKeyFieldProps) => {
  const { fileNameState } = useFileNameStore();
  const { addKEyToFilesInfo } = useEditAllFileStore();
  const { DBkeys, addKeyToTree } = useKeyStore();
  const [newKeyState, setNewKeyState] = useState("");
  const [isKeyExisted, setIsKeyExisted] = useState(false);
  const handleAddKey = async () => {
    console.log("Adding new key:", newKeyState);
    //check if newKeyState already exists in DBKeys
    const keys = DBkeys.find(
      (e: { fileName: string; keys: TranslationTreeKey[] }) =>
        e.fileName === fileNameState
    )?.keys;
    const isKeyExists = keys?.find(
      (e) => e.full_key_path === newKeyState
    )?.full_key_path;
    if (isKeyExists) {
      setIsKeyExisted(true);
      console.log(`Key "${newKeyState}" already exists.`);
    } else {
      const keySegments = newKeyState.split(".");
      const level = keySegments.length - 1;
      const keyPathSegment = keySegments[keySegments.length - 1];

      const parentKey = keySegments.slice(0, -1).join(".") || null;
      const parentID =
        DBkeys.find((e) => e.fileName === fileNameState)?.keys.find(
          (e) => e.full_key_path === parentKey
        )?.id || null;

      const newKey = {
        id: crypto.randomUUID(),
        full_key_path: newKeyState,
        value: "",
        has_children: false,
        file_id: fileNameState,
        parent_id: parentID,
        level,
        key_path_segment: keyPathSegment,
      };
      const newKeyForFileInfo = {
        fullKeyPath: newKeyState,
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
      setNewKeyState("");
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
    <>
      <Stack direction={"column"}>
        <TextField
          onChange={(e) => setNewKeyState(e.target.value.trim())}
          variant='outlined'
          sx={{
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
        {isKeyExisted && (
          <Typo1224 style={{ color: "red", fontSize: "12px" }}>
            Key already exists!
          </Typo1224>
        )}
      </Stack>

      <Button
        variant='contained'
        onClick={() => setOpenAddKeyField(false)}
        sx={{ marginLeft: "10px" }}
      >
        Cancel
      </Button>
    </>
  );
};
