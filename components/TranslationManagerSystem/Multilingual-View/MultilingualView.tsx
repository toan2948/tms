"use client";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { SelectChangeEvent } from "@mui/material/Select";
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";
import { SessionDialog } from "./Dialogs/SessionDialog";
import TreeView from "./TreeView/TreeView";
import AllChangesView from "./AllChangesVew/AllChangesView";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { TranslationTreeKey } from "@/types/translation";
import {
  fetchAllTranslationFiles,
  fetchTranslationKeysByFilenameAndLanguage,
} from "@/utils/languages/dataFunctions";
import { buildKeyTreeFromFlatList } from "@/utils/languages/processData";
import { AddKeyField } from "./AddKeyField";
export const HeaderBox = styled(Stack)(({}) => ({
  width: "100%",
  borderBottom: "solid 1px black",
  maxHeight: "50px",
  minHeight: "50px",
  alignItems: "center",
  justifyContent: "center",
}));
const MultilingualView = () => {
  const { fileNameState, changeFileName: change } = useFileNameStore();
  const handleChange = (event: SelectChangeEvent) => {
    change(event.target.value as string);
    // setFocusedKey(""); // Reset focused key when changing file
  };

  const [seeAllChanges, setSeeAllChanges] = React.useState(false);

  const [openDialog, setOpenDialog] = React.useState(false);

  const [treeKeys, setTreeKeys] = useState<TranslationTreeKey[]>([]);
  const { DBkeys, setDBKeys } = useKeyStore();
  const { setFilesInfo, setDBFilesInfo } = useEditAllFileStore();

  // Fetch file data once on mount
  useEffect(() => {
    async function fetchKeysAndSaveToLocal() {
      try {
        const data = await fetchAllTranslationFiles();
        const localStorageFilesInfo = localStorage.getItem("translationEdits");

        if (localStorageFilesInfo !== null && localStorageFilesInfo !== "[]") {
          console.log("Using data from localStorage");
          const parsedData = JSON.parse(localStorageFilesInfo);
          setFilesInfo(parsedData);
        } else {
          setFilesInfo(data);
          localStorage.setItem("translationEdits", JSON.stringify(data));
        }
        setDBFilesInfo(data);
      } catch (error) {
        console.error("Error loading translation data:", error);
      }
    }

    fetchKeysAndSaveToLocal();
  }, [fileNameState]);

  // Fetch keys when file changes
  useEffect(() => {
    async function fetchKeysForBuildingTree() {
      try {
        const keys = await fetchTranslationKeysByFilenameAndLanguage(
          fileNameState,
          "en" //it does not matter which language we use here, as we are fetching all keys
        );
        setDBKeys(keys, fileNameState);
        const tree = buildKeyTreeFromFlatList(keys);
        setTreeKeys(tree);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    // Check if keys are already available in the store
    const treeKeys = DBkeys.find((e) => e.fileName === fileNameState)?.keys;
    if (treeKeys) {
      const tree = buildKeyTreeFromFlatList(treeKeys);

      setTreeKeys(tree);
    } else if (fileNameState) {
      fetchKeysForBuildingTree();
    } else {
      console.warn("fileNameState is empty, skipping key fetch");
    }
  }, [fileNameState, JSON.stringify(DBkeys)]);

  return (
    <>
      <SessionDialog
        open={openDialog}
        onClose={setOpenDialog}
        setSeeAllChanges={setSeeAllChanges}
      />
      <Stack direction={"row"} justifyContent={"space-between"}>
        <FormControl
          sx={{
            width: "20%",
            marginBottom: "20px",
            visibility: !seeAllChanges ? "visible" : "hidden",
          }}
        >
          <InputLabel id='demo-simple-select-label'>filename</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={fileNameState}
            label='filename'
            onChange={handleChange}
          >
            <MenuItem value={"common"}>Common</MenuItem>
            <MenuItem value={"movie"}>Movie</MenuItem>
          </Select>
        </FormControl>

        <AddKeyField />

        <Box>
          <Button
            variant='contained'
            onClick={() => {
              setSeeAllChanges(!seeAllChanges);
            }}
            sx={{
              marginRight: "10px",
              backgroundColor: "#4caf50",
            }}
          >
            {!seeAllChanges ? "See All Changes " : "See Tree View"}
          </Button>
          <Button onClick={() => setOpenDialog(true)} variant='contained'>
            Save Session
          </Button>
        </Box>
      </Stack>
      {seeAllChanges ? (
        <AllChangesView setSeeAllChanges={setSeeAllChanges} />
      ) : (
        <TreeView treeKeys={treeKeys} />
      )}
    </>
  );
};

export default MultilingualView;
