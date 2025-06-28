"use client";
import { List, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import TranslationField from "./TranslationField";
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";
import { TStep } from "@/utils/languages/fetchValuesByKeyID";
interface TranslationValueListProps {
  selectedKey: string | null;
}

const TranslationValueList = ({ selectedKey }: TranslationValueListProps) => {
  // console.log("Selected Value List:", selectedKey);

  const { fileNameState } = useFileNameStore();
  const { fullKeyPath } = useKeyStore();

  const [valuesState, setValuesState] = React.useState<
    {
      language_name: string;
      language_code: string;
      filename: string;
      id: string;
      value: string | null;
    }[]
  >([]);

  useEffect(() => {
    console.log("File Name State,fullKeyPath:", fileNameState, fullKeyPath);
    // async function fetchData() {
    //   try {
    //     const values = await fetchTranslationsByPathAndFilename(
    //       fullKeyPath,
    //       fileNameState
    //     );
    //     // console.log("Fetched Values:", values);
    //     // setValuesState(values);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   }
    // }
    async function fetchData2() {
      try {
        const values = await TStep(fullKeyPath, fileNameState);
        // console.log("Fetched Values:", values);
        setValuesState(values);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData2();

    // fetchData();
    console.log("Values State Updated", valuesState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileNameState, fullKeyPath, selectedKey]); //valuesState in this condition will cause infinite loop
  useEffect(() => {
    console.log("useEffect2");
  }, [fileNameState, fullKeyPath, selectedKey]);

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
        {/* //todo: note- if key= e.key, there will be an absurb rendering */}

        {valuesState.map((e, index) => (
          <TranslationField index={index} key={index} data={e} />
        ))}
      </List>
      {/* </form> */}
    </Stack>
  );
};

export default TranslationValueList;
