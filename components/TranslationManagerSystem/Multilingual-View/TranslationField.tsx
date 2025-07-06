"use client";
import { ListItem, Stack, TextareaAutosize, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useKeyStore } from "@/store/useFileNameStore";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { TranslationValue } from "@/types/translation";
type TranslationFieldProps = {
  index: number;
  data: TranslationValue;
  bilingual?: boolean;
};
const TranslationField = ({
  index,
  data,
  bilingual,
}: TranslationFieldProps) => {
  const [activateButton, setActivateButton] = useState(false);
  const [value, setValue] = useState(data.value);
  const { fullKeyPath } = useKeyStore();
  const { updateKeyChanged } = useEditAllFileStore();

  // console.log("TranslationField Data:", fullKeyPath, data);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };
  const handleSave = () => {
    updateKeyChanged({
      fullKeyPath: fullKeyPath,
      id: data.id,
      isChanged: true,
      value: value,
    });
    setActivateButton(false);
  };

  useEffect(() => {
    if (value && value.length > 0 && value !== data.value) {
      setActivateButton(true);
    } else {
      setActivateButton(false);
    }
  }, [value]);
  useEffect(() => {
    setValue(data.value ?? "");
  }, [data.value]);

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
          value={value ?? ""}
          onChange={(e) => handleChange(e)}
          style={{
            minWidth: "100%",
            maxWidth: "100%",
            border: "1px solid black",
            borderRadius: "4px",
          }}
        />
        {/* <Typo1424 color={"red"}>Saved to Session!</Typo1424> */}
      </Stack>

      <Button disabled={!activateButton} onClick={() => handleSave()}>
        Save
      </Button>
    </ListItem>
  );
};

export default TranslationField;
