import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { TranslationTreeKey } from "@/types/translation";
import { fetchTranslationKeysByFilenameAndLanguage } from "@/utils/languages/dataFunctions";
import { buildKeyTreeFromFlatList } from "@/utils/languages/processData";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { HeaderBox } from "../MultilingualView";
import BasicSimpleTreeView from "./BasicSimpleTreeView";
import TranslationValueList from "./TranslationValueList";
type TreeVewProps = {
  test?: boolean;
};

const TreeView = ({}: TreeVewProps) => {
  const { fileNameState } = useFileNameStore();

  const [treeKeys, setTreeKeys] = useState<TranslationTreeKey[]>([]);
  const { setDBKeys } = useTreeKeyStore();
  const { filesInfo } = useAllKeyFileStore();
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
