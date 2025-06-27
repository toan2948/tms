"use client";
import { ListItem, Stack, TextareaAutosize, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
type TranslationFieldProps = {
  index: number;
  data: {
    language_name: string;
    language_code: string;
    filename: string;
    id: string;
    value: string | null;
  };
  bilingual?: boolean;
};
const TranslationField = ({
  index,
  data,
  bilingual,
}: TranslationFieldProps) => {
  const [activateButton, setActivateButton] = useState(false);
  const [value, setValue] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };
  useEffect(() => {
    if (value.length > 0) {
      setActivateButton(true);
    } else {
      setActivateButton(false);
    }
  }, [value]);

  console.log("TranslationField Data:", data);
  return (
    <ListItem
      key={index}
      sx={{
        width: "100%",
        alignItems: "baseline",
        backgroundColor: index % 2 !== 0 ? "#d3d3d3" : "transparent", // Using a brighter color than grey
      }}
    >
      <Typo1424 width={bilingual ? "20%" : "100%"}>
        {data.language_name}
      </Typo1424>
      <Stack sx={{ width: "100%" }}>
        <TextareaAutosize
          minRows={2}
          maxRows={2}
          value={data.value || ""}
          onChange={(e) => handleChange(e)}
          style={{ minWidth: "100%", maxWidth: "100%" }}
        />
        <Typo1424 color={"red"}>Saved!</Typo1424>
      </Stack>

      <Button disabled={!activateButton}>Save</Button>
    </ListItem>
  );
};

export default TranslationField;
