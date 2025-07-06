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
import TranslationValueList from "./TranslationValueList";
import BasicSimpleTreeView from "./BasicSimpleTreeView";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import {
  fetchTranslationKeysByFilenameAndLanguage,
  getAllTranslationFiles,
} from "@/utils/languages/dataFunctions";
import { buildKeyTreeFromFlatList } from "@/utils/languages/processData";
import { TranslationTreeKey } from "@/types/translation";
import { SelectChangeEvent } from "@mui/material/Select";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { SessionDialog } from "./SessionDialog/SessionDialog";
export const HeaderBox = styled(Stack)(({}) => ({
  width: "100%",
  borderBottom: "solid 1px black",
  maxHeight: "50px",
  minHeight: "50px",
  alignItems: "center",
  justifyContent: "center",
}));
const MultilingualView = () => {
  const [treeKeys, setTreeKeys] = useState<TranslationTreeKey[]>([]);
  const { fileNameState, change } = useFileNameStore();
  const { filesInfo, initialSet } = useEditAllFileStore();
  const handleChange = (event: SelectChangeEvent) => {
    change(event.target.value as string);
  };

  useEffect(() => {
    async function fetchFileKey() {
      try {
        const data = await getAllTranslationFiles();
        initialSet(data);
        const localStorageFilesInfo = localStorage.getItem("translationEdits");
        if (!localStorageFilesInfo)
          localStorage.setItem("translationEdits", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchFileKey();
  }, []);
  console.log("Files Info:", filesInfo);

  useEffect(() => {
    async function fetchData() {
      try {
        const keys = await fetchTranslationKeysByFilenameAndLanguage(
          fileNameState,
          "en"
        );
        const tree = buildKeyTreeFromFlatList(keys);
        setTreeKeys(tree);
        console.log("Fetched Keys:", keys);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [fileNameState]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <>
      <SessionDialog open={openDialog} onClose={setOpenDialog} />
      <Stack direction={"row"} justifyContent={"space-between"}>
        <FormControl
          sx={{
            width: "20%",
            marginBottom: "20px",
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
        <Box>
          <Button onClick={() => setOpenDialog(true)} variant='contained'>
            Save Session
          </Button>
        </Box>
      </Stack>

      <Stack
        direction={"row"}
        border={"solid 1px black"}
        justifyContent={"space-around"}
        maxHeight='500px'
      >
        <Stack width={"50%"} borderRight={"solid 1px black"}>
          <HeaderBox>
            <Typo1424 textAlign={"center"}>Keys</Typo1424>
          </HeaderBox>
          <BasicSimpleTreeView
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
            data={treeKeys}
          />
        </Stack>
        <Stack width={"100%"}>
          <HeaderBox>
            <Typo1424 textAlign={"center"}>Language</Typo1424>
          </HeaderBox>
          <Typo1424>Key to translate: {selectedKey}</Typo1424>

          <TranslationValueList selectedKey={selectedKey} />
        </Stack>
      </Stack>
    </>
  );
};

export default MultilingualView;
