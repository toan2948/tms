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

import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { TranslationTreeKey } from "@/types/translation";
import {
  fetchAllTranslationFiles,
  fetchLanguages,
  fetchTranslationKeysByFilenameAndLanguage,
} from "@/utils/languages/dataFunctions";
import {
  buildKeyTreeFromFlatList,
  populateOldValuesAndOldVersion,
} from "@/utils/languages/processData";
import { SelectChangeEvent } from "@mui/material/Select";
import { AddKeyField } from "./AddKeyField";
import AllChangesView from "./AllChangesVew/AllChangesView";
import { SessionDialog } from "./Dialogs/SessionDialog";
import TreeView from "./TreeView/TreeView";
export const HeaderBox = styled(Stack)(({}) => ({
  width: "100%",
  borderBottom: "solid 1px black",
  maxHeight: "50px",
  minHeight: "50px",
  alignItems: "center",
  justifyContent: "center",
}));
const MultilingualView = () => {
  const { fileNameState, setFileName } = useFileNameStore();
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedTreeKey(null); // Reset selected key when changing file

    setFileName(event.target.value as string);
  };

  const [seeAllChanges, setSeeAllChanges] = React.useState(false);

  const [openDialog, setOpenDialog] = React.useState(false);

  const [treeKeys, setTreeKeys] = useState<TranslationTreeKey[]>([]);
  const { DBkeys, setDBKeys, setSelectedTreeKey } = useTreeKeyStore();
  const { setFilesInfo, setLanguages } = useEditAllFileStore();

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
          setFilesInfo(populateOldValuesAndOldVersion(data));
          localStorage.setItem(
            "translationEdits",
            JSON.stringify(populateOldValuesAndOldVersion(data))
          );
        }
      } catch (error) {
        console.error("Error loading translation data:", error);
      }
    }

    fetchKeysAndSaveToLocal();
  }, [fileNameState]);

  useEffect(() => {
    async function fetchAndSaveLanguages() {
      try {
        const lgs = await fetchLanguages();
        // console.log("Fetched languages:", lgs);
        setLanguages(lgs);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    }
    fetchAndSaveLanguages();
  }, []);

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
    //always fetch keys when fileNameState changes, or the page is mounted. That will update the key changes (edited, deleted, added)

    // fetchKeysForBuildingTree();

    // ---

    if (!fileNameState) {
      console.warn("⚠️ fileNameState is empty, skipping fetch");
      return;
    }

    const localStorageDBKeys = localStorage.getItem("DBkeys");

    if (localStorageDBKeys) {
      const parsedData: { fileName: string; keys: TranslationTreeKey[] }[] =
        JSON.parse(localStorageDBKeys);
      const entry = parsedData.find((e) => e.fileName === fileNameState) || {
        fileName: fileNameState,
        keys: [],
      };
      if (entry?.keys.length > 0) {
        setDBKeys(entry.keys, fileNameState);
        setTreeKeys(buildKeyTreeFromFlatList(entry?.keys));
      } else {
        fetchKeysForBuildingTree();
      }
    } else {
      fetchKeysForBuildingTree();
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
