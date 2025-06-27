"use client";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import TranslationValueList from "./TranslationValueList";
import BasicSimpleTreeView from "../BasicSimpleTreeView";
import {
  convertPropertiesToKeyArray,
  convertPropertiesToKeyValueArray,
  findElementByKeyPresence,
  TranslationSetType,
} from "@/lib/jsonPlay/playJson";
import nestedData from "@/lib/jsonPlay/nestedData.json";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { fetchTranslationKeysByFilenameAndLanguage } from "@/utils/languages/dataFunctions";
import { buildKeyTreeFromFlatList } from "@/utils/languages/processData";
import { TranslationTreeKey } from "@/types/translation";
import { SelectChangeEvent } from "@mui/material/Select";
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
  const [filename, setFilename] = React.useState("common");

  const handleChange = (event: SelectChangeEvent) => {
    setFilename(event.target.value as string);
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const keys = await fetchTranslationKeysByFilenameAndLanguage(
          filename,
          "en"
        );
        const tree = buildKeyTreeFromFlatList(keys);
        setTreeKeys(tree);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [filename]);
  const keyList = useMemo(() => {
    const arr = convertPropertiesToKeyArray(nestedData[0]);
    arr.shift();
    return arr.length > 0 ? arr : [];
  }, [nestedData]);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    keyList[0] || null
  );
  const keyValueArray = useMemo(() => {
    return nestedData.map((e) => convertPropertiesToKeyValueArray(e));
  }, [nestedData]);

  // console.log("Key value array, selectedKey:", keyValueArray, selectedKey);

  const [selectedValue, setSelectedValue] = useState<TranslationSetType[]>(
    keyValueArray.map((e) =>
      findElementByKeyPresence(
        e.map((item) => ({ ...item, value: String(item.value) })),
        selectedKey || ""
      )
    )
  );

  useEffect(() => {
    setSelectedValue(
      keyValueArray.map((e) =>
        findElementByKeyPresence(
          e.map((item) => ({ ...item, value: String(item.value) })),
          selectedKey || ""
        )
      )
    );
  }, [selectedKey]);
  return (
    <>
      <FormControl fullWidth>
        <InputLabel id='demo-simple-select-label'>filename</InputLabel>
        <Select
          labelId='demo-simple-select-label'
          id='demo-simple-select'
          value={filename}
          label='filename'
          onChange={handleChange}
        >
          <MenuItem value={"common"}>Common</MenuItem>
          <MenuItem value={"movie"}>Movie</MenuItem>
        </Select>
      </FormControl>

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

          <TranslationValueList selectedValue={selectedValue} />
        </Stack>
      </Stack>
    </>
  );
};

export default MultilingualView;
