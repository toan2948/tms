"use client";
import { Stack } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import TranslationValueList from "./TranslationValueList";
import BasicSimpleTreeView from "../TreeData";
import { HeaderBox, TranslationPageProps } from "..";
import {
  convertPropertiesToKeyArray,
  convertPropertiesToKeyValueArray,
  findElementByKeyPresence,
  TranslationSetType,
} from "@/lib/jsonPlay/playJson";
import nestedData from "@/lib/jsonPlay/nestedData.json";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";

const MultilingualView = ({ data }: TranslationPageProps) => {
  const keyList = useMemo(() => {
    const arr = convertPropertiesToKeyArray(nestedData[0]);
    arr.shift();
    return arr.length > 0 ? arr : [];
  }, [nestedData]);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    keyList[0] || null
  );
  const keyValueArray = useMemo(() => {
    // console.log("Nested Data:", nestedData);
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
          data={data}
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
  );
};

export default MultilingualView;
