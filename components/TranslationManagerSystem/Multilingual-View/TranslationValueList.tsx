"use client";
import { List, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import TranslationField from "./TranslationField";
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { getTranslationKeys } from "@/utils/languages/dataFunctions";
import { TranslationValue } from "@/types/translation";
interface TranslationValueListProps {
  selectedKey: string | null;
}

const TranslationValueList = ({ selectedKey }: TranslationValueListProps) => {
  const { fileNameState } = useFileNameStore();
  const { fullKeyPath } = useKeyStore();

  const [valuesState, setValuesState] = React.useState<TranslationValue[]>([]);

  const { filesInfo } = useEditAllFileStore();

  useEffect(() => {
    const localStorageFilesInfo = localStorage.getItem("translationEdits")
      ? JSON.parse(localStorage.getItem("translationEdits") as string)
      : [];
    console.log("Local Storage Files Info:", localStorageFilesInfo);

    setValuesState(
      getTranslationKeys(
        fileNameState,
        fullKeyPath,
        localStorageFilesInfo ? localStorageFilesInfo : filesInfo
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileNameState, fullKeyPath, selectedKey]); //valuesState in this condition will cause infinite loop

  const {
    formState: {},
  } = useForm({
    defaultValues: {
      english: "",
      chinese: "",
      spanish: "",
    },
  });

  return (
    <Stack direction={"row"} width={"100%"} sx={{ overflowY: "scroll" }}>
      {/* <form
        onSubmit={handleSubmit((data) => {
          alert(JSON.stringify(data));
        })}
      > */}
      <List sx={{ width: "100%" }}>
        {/* //todo: note- if key= e.key, there will be an absurd rendering */}

        {valuesState.map((e, index) => (
          <TranslationField index={index} key={index} data={e} />
        ))}
      </List>
      {/* </form> */}
    </Stack>
  );
};

export default TranslationValueList;
