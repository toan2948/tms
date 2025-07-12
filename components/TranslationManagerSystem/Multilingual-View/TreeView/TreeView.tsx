import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { HeaderBox } from "../MultilingualView";
import BasicSimpleTreeView from "./BasicSimpleTreeView";
import TranslationValueList from "./TranslationValueList";
import { TranslationTreeKey } from "@/types/translation";
import {
  fetchAllTranslationFiles,
  fetchTranslationKeysByFilenameAndLanguage,
} from "@/utils/languages/dataFunctions";
import { buildKeyTreeFromFlatList } from "@/utils/languages/processData";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";

const TreeView = () => {
  const [treeKeys, setTreeKeys] = useState<TranslationTreeKey[]>([]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { fileNameState } = useFileNameStore();
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

  // console.log("Files Info:", filesInfo);

  useEffect(() => {
    async function fetchKeysForBuildingTree() {
      try {
        const keys = await fetchTranslationKeysByFilenameAndLanguage(
          fileNameState,
          "en" //it does not matter which language we use here, as we are fetching all keys
        );
        const tree = buildKeyTreeFromFlatList(keys);
        setTreeKeys(tree);
        // console.log("Fetched Keys:", keys);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchKeysForBuildingTree();
  }, [fileNameState]);
  return (
    <>
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

export default TreeView;
