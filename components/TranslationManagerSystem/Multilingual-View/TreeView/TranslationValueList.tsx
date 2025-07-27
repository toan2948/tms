"use client";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { KeyState } from "@/types/translation";
import {
  filterTranslationKeys,
  getTranslationKeys,
} from "@/utils/languages/processData";
import { List, Stack } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import TranslationField from "./TranslationField";

const TranslationValueList = () => {
  const { fileNameState } = useFileNameStore();
  const { selectedTreeKey } = useTreeKeyStore();

  const [valuesState, setValuesState] = React.useState<KeyState[]>([]);
  const [showValueList, setShowValueList] = React.useState(false);

  const { filesInfo } = useAllKeyFileStore();

  //this changedKeys is used as a dependent factor in useEffect to update valuesState when the state FilesInfo is changed
  //filesInfo can not be used directly in useEffect because it will cause a bug as filesInfo is a dynamic state that can change the size of dependencies array of the useEffect
  const changedKeys = useMemo(
    () => filterTranslationKeys(filesInfo),
    [filesInfo]
  );

  useEffect(() => {
    setValuesState(
      getTranslationKeys(
        fileNameState,
        selectedTreeKey?.full_key_path ? selectedTreeKey.full_key_path : "",
        filesInfo,
        selectedTreeKey?.key_path_segment
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileNameState, selectedTreeKey, changedKeys]); //valuesState in this condition will cause infinite loop

  useEffect(() => {
    // console.log("valuesState", valuesState);
    if (valuesState.find((e) => e.has_children === true)) {
      setShowValueList(false);
    } else {
      setShowValueList(true);
    }
  }, [valuesState]);

  if (showValueList) {
    return (
      <Stack direction={"row"} width={"100%"} sx={{ overflowY: "scroll" }}>
        <List sx={{ width: "100%" }}>
          {/* //todo: note- if key= e.key, there will be an absurd rendering */}

          {valuesState.map((e, index) => (
            <TranslationField index={index} key={index} data={e} />
          ))}
        </List>
      </Stack>
    );
  } else return null;
};

export default TranslationValueList;
