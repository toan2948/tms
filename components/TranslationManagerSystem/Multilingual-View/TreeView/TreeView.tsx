import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { Button, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { HeaderBox } from "../MultilingualView";
import BasicSimpleTreeView from "./BasicSimpleTreeView";
import TranslationValueList from "./TranslationValueList";
import { TranslationTreeKey } from "@/types/translation";
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";

const TreeView = ({ treeKeys }: { treeKeys: TranslationTreeKey[] }) => {
  const { DBkeys, updateFullKeyPathState } = useKeyStore();
  const [selectedKeyID, setSelectedKeyID] = useState<string | null>(null);
  const [path_segment, setPathSegment] = useState<string | null>(null);
  const { fileNameState } = useFileNameStore();

  useEffect(() => {
    const keysInFile = DBkeys.find((e) => e.fileName === fileNameState)?.keys;
    if (!keysInFile) {
      console.warn("No keys found for the current file:", fileNameState);
      return;
    }
    const key = keysInFile.find((k) => k.id === selectedKeyID);
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
        <Stack width={"100%"} direction={"column"}>
          <HeaderBox>
            <Typo1424 textAlign={"center"}>Language</Typo1424>
          </HeaderBox>
          <Stack width={"100%"} direction={"row"}>
            <Typo1424>Key to translate: {path_segment}</Typo1424>
            <Button variant={"outlined"}>Delete</Button>
            <Button variant={"outlined"}>Edit</Button>
          </Stack>
          <TranslationValueList path_segment={path_segment} />
        </Stack>
      </Stack>
    </>
  );
};

export default TreeView;
