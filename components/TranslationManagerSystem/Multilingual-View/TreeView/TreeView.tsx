import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { TranslationTreeKey } from "@/types/keyType";
import { fetchAllTranslationFiles } from "@/utils/languages/dataFunctions";
import { buildKeyTreeFromFlatList } from "@/utils/languages/processData";
import { Stack, styled } from "@mui/material";
import { useEffect, useState } from "react";
import BasicSimpleTreeView from "./BasicSimpleTreeView";
import TranslationValueList from "./FieldList/TranslationValueList";
export const HeaderBox = styled(Stack)(({}) => ({
  width: "100%",
  borderBottom: "solid 1px black",
  maxHeight: "50px",
  minHeight: "50px",
  alignItems: "center",
  justifyContent: "center",
}));
type TreeVewProps = {
  test?: boolean;
};

const TreeView = ({}: TreeVewProps) => {
  const { fileNameState } = useOtherStateStore();

  const [treeKeys, setTreeKeys] = useState<TranslationTreeKey[]>([]);
  const { filesInfo, setFilesInfo } = useAllKeyFileStore();

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
        }
      } catch (error) {
        console.error("Error loading translation data:", error);
      }
    }

    fetchKeysAndSaveToLocal();
  }, [fileNameState, JSON.stringify(filesInfo)]);

  useEffect(() => {
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
        setTreeKeys(buildKeyTreeFromFlatList(entry?.keys));
      }
    }
  }, [fileNameState, JSON.stringify(filesInfo)]); //filesInfo is used to trigger the effect when files are updated

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
          <BasicSimpleTreeView data={treeKeys} />
        </Stack>
        <Stack width={"100%"} direction={"column"}>
          <HeaderBox>
            <Typo1424 textAlign={"center"}>Language</Typo1424>
          </HeaderBox>
          <TranslationValueList />
        </Stack>
      </Stack>
    </>
  );
};

export default TreeView;
