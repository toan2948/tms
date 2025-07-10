"use client";
import { List, Stack } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import TranslationField from "./TranslationField";
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { TranslationValue } from "@/types/translation";
import {
  filterTranslationKeys,
  getTranslationKeys,
} from "@/utils/languages/processData";
interface TranslationValueListProps {
  selectedKey: string | null;
}

const TranslationValueList = ({ selectedKey }: TranslationValueListProps) => {
  const { fileNameState } = useFileNameStore();
  const { fullKeyPath } = useKeyStore();

  const [valuesState, setValuesState] = React.useState<TranslationValue[]>([]);

  const { filesInfo } = useEditAllFileStore();

  //this changedKeys is used as a dependent factor in useEffect to update valuesState when the state FilesInfo is changed
  //filesInfo can not be used directly in useEffect because it will cause a bug as filesInfo is a dynamic state that can change the size of dependencies array of the useEffect
  const changedKeys = useMemo(
    () => filterTranslationKeys(filesInfo),
    [filesInfo]
  );

  useEffect(() => {
    // const localStorageFilesInfo = localStorage.getItem("translationEdits")
    //   ? JSON.parse(localStorage.getItem("translationEdits") as string)
    //   : [];
    // // console.log("Local Storage Files Info:", localStorageFilesInfo);

    setValuesState(getTranslationKeys(fileNameState, fullKeyPath, filesInfo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileNameState, fullKeyPath, selectedKey, changedKeys]); //valuesState in this condition will cause infinite loop

  useEffect(() => {
    console.log("valuesState", valuesState);
  }, [valuesState]);

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
};

export default TranslationValueList;
