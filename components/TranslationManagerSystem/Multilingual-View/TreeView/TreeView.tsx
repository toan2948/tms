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
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";

const TreeView = () => {
  const [treeKeys, setTreeKeys] = useState<TranslationTreeKey[]>([]);
  const { DBkeys, setDBKeys, updateFullKeyPathState } = useKeyStore();
  const [selectedKeyID, setSelectedKeyID] = useState<string | null>(null);
  const [path_segment, setPathSegment] = useState<string | null>(null);
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

  useEffect(() => {
    async function fetchKeysForBuildingTree() {
      try {
        const keys = await fetchTranslationKeysByFilenameAndLanguage(
          fileNameState,
          "en" //it does not matter which language we use here, as we are fetching all keys
        );
        setDBKeys(keys);
        const tree = buildKeyTreeFromFlatList(keys);
        setTreeKeys(tree);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchKeysForBuildingTree();
  }, [fileNameState]);

  useEffect(() => {
    const key = DBkeys.find((key) => key.id === selectedKeyID);
    if (key) {
      updateFullKeyPathState(key.full_key_path);
      setPathSegment(key.key_path_segment);
    } else {
      setSelectedKeyID(null);
    }
  }, [selectedKeyID]);
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
            selectedKey={selectedKeyID}
            setSelectedKey={setSelectedKeyID}
            data={treeKeys}
          />
        </Stack>
        <Stack width={"100%"}>
          <HeaderBox>
            <Typo1424 textAlign={"center"}>Language</Typo1424>
          </HeaderBox>
          <Typo1424>Key to translate: {path_segment}</Typo1424>

          <TranslationValueList path_segment={path_segment} />
        </Stack>
      </Stack>
    </>
  );
};

export default TreeView;
