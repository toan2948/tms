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
  path_segment: string | null;
}

const TranslationValueList = ({ path_segment }: TranslationValueListProps) => {
  const { fileNameState } = useFileNameStore();
  const { fullKeyPath } = useKeyStore();

  const [valuesState, setValuesState] = React.useState<TranslationValue[]>([]);
  const [showValueList, setShowValueList] = React.useState(false);

  const { filesInfo, DBFilesInfo } = useEditAllFileStore();

  //this changedKeys is used as a dependent factor in useEffect to update valuesState when the state FilesInfo is changed
  //filesInfo can not be used directly in useEffect because it will cause a bug as filesInfo is a dynamic state that can change the size of dependencies array of the useEffect
  const changedKeys = useMemo(
    () => filterTranslationKeys(filesInfo, DBFilesInfo),
    [filesInfo]
  );

  useEffect(() => {
    setValuesState(
      getTranslationKeys(fileNameState, fullKeyPath, filesInfo, path_segment)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileNameState, fullKeyPath, path_segment, changedKeys]); //valuesState in this condition will cause infinite loop

  useEffect(() => {
    console.log("valuesState", valuesState);
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
