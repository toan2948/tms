"use client";
import { List, Stack } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import TranslationField from "./TranslationField";
interface TranslationValueListProps {
  selectedValue: { key: string; lg: string; value: string }[];
}

const TranslationValueList = ({ selectedValue }: TranslationValueListProps) => {
  // console.log("Selected Value List:", selectedValue);
  const {
    formState: {},
  } = useForm({
    defaultValues: {
      english: "",
      chinese: "",
      spanish: "",
    },
  });

  // console.log("TranslationValueList Props:", selectedValue);
  return (
    <Stack direction={"row"} width={"100%"} sx={{ overflowY: "scroll" }}>
      {/* <form
        onSubmit={handleSubmit((data) => {
          alert(JSON.stringify(data));
        })}
      > */}
      <List sx={{ width: "100%" }}>
        {/* //todo: note- if key= e.key, there will be an absurb rendering */}

        {selectedValue.map((e, index) => (
          <TranslationField index={index} key={index} languageLabel={e.lg} />
        ))}
      </List>
      {/* </form> */}
    </Stack>
  );
};

export default TranslationValueList;
