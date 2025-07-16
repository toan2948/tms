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
  TextField,
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
  };

  const [seeAllChanges, setSeeAllChanges] = React.useState(false);

  const [openDialog, setOpenDialog] = React.useState(false);

  const [treeKeys, setTreeKeys] = useState<TranslationTreeKey[]>([]);
  const { setDBKeys } = useKeyStore();
  const { setFilesInfo, setDBFilesInfo } = useEditAllFileStore();

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
    console.log(
      "Fetching keys for building tree with fileNameState:",
      fileNameState
    );

    fetchKeysForBuildingTree();
  }, [fileNameState]);

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
        <FormControl
          sx={{
            width: "20%",
            marginBottom: "20px",
          }}
        >
          <InputLabel id='demo-simple-select-label'></InputLabel>
          <TextField>Add Key</TextField>
        </FormControl>

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
