"use client";
import {
  ListItem,
  TextareaAutosize,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useKeyStore } from "@/store/useFileNameStore";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { TranslationValue } from "@/types/translation";
import { findKeyStateByIdAcrossFiles } from "@/utils/languages/processData";
type TranslationFieldProps = {
  index: number;
  data: TranslationValue;
  bilingual?: boolean;
};
const TranslationField = ({ index, data }: TranslationFieldProps) => {
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [value, setValue] = useState(data.value);
  const { fullKeyPath } = useKeyStore();
  const { updateKeyChanged } = useEditAllFileStore();
  const localStorageDBValues = useMemo(() => {
    return localStorage.getItem("currentDBvalues")
      ? JSON.parse(localStorage.getItem("currentDBvalues") as string)
      : [];
  }, [data]);

  const DBValue = useMemo(
    () => findKeyStateByIdAcrossFiles(localStorageDBValues, data.id),
    [data.id, localStorageDBValues]
  );

  console.log("DBValue:, Local/state Data:", DBValue?.value, "/", data.value);
  const [isResetButtonEnabled, setIsResetButtonEnabled] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    setIsSaveButtonEnabled(true);
  };
  const handleSave = () => {
    updateKeyChanged({
      fullKeyPath: fullKeyPath,
      id: data.id,
      isChanged: true,
      value: value,
      version: data.version ? data.version + 1 : 1,
      last_edited_at: new Date(),
    });
    setIsSaveButtonEnabled(false);
    setIsResetButtonEnabled(true);
    //value state is temporally not set here
  };
  const handleReset = () => {
    // console.log("Resetting value to DBValue:", DBValue?.value, value);
    updateKeyChanged({
      fullKeyPath: fullKeyPath,
      id: data.id,
      isChanged: false,
      value: DBValue?.value ?? "",
      version: data.version ? data.version - 1 : 0,
      last_edited_at: DBValue?.last_edited_at
        ? new Date(DBValue.last_edited_at)
        : new Date(),
    });
    setValue(DBValue?.value ?? "");
    setIsSaveButtonEnabled(false);
    setIsResetButtonEnabled(false);
  };

  useEffect(() => {
    if (value === DBValue?.value) {
      setIsSaveButtonEnabled(false);
    }
  }, [value]);
  useEffect(() => {
    //set the initial value for the value state
    setValue(data.value ?? "");
  }, [data.value]);

  useEffect(() => {
    if (DBValue?.value !== data.value) {
      //set the reset button at initial render
      setIsResetButtonEnabled(true);
    } else {
      setIsResetButtonEnabled(false);
    }
  }, [data.value, DBValue?.value]);

  return (
    <ListItem
      key={index}
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "stretch", // this is CRITICAL
        backgroundColor: index % 2 !== 0 ? "#d3d3d3" : "#F5F5F5", // Using a brighter color than grey
      }}
    >
      <Stack paddingRight={"5px"} width={"17%"}>
        <Typo1424 weight={600}>{data.language_name}</Typo1424>
        <Typo1424>
          v{data.version}:
          {data.last_edited_at
            ? new Date(data.last_edited_at).toISOString().substring(0, 10)
            : ""}
        </Typo1424>
      </Stack>

      <Paper
        variant='outlined'
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          width: "100%",
          flexGrow: 1,
        }}
      >
        <Grid container>
          <Grid
            size={2}
            sx={{ borderRight: "1px solid", borderColor: "divider", p: 2 }}
          >
            <Typography>{isResetButtonEnabled && "New"}</Typography>
          </Grid>

          <Grid size={10} sx={{ p: 2 }}>
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
          </Grid>
        </Grid>
        {isResetButtonEnabled && (
          <Grid container>
            <Grid
              size={2}
              sx={{ borderRight: "1px solid", borderColor: "divider", p: 2 }}
            >
              <Typography>Old</Typography>
            </Grid>
            <Grid size={10} sx={{ p: 2 }}>
              <Typo1424 color={"red"}>{DBValue?.value}</Typo1424>
            </Grid>
          </Grid>
        )}
      </Paper>
      <Box>
        <Stack
          ml={"5px"}
          direction={"column"}
          justifyContent={"space-around"}
          sx={{
            height: "100%", // fill available parent height
          }}
        >
          <Box width={"90px"}>
            <Button
              variant='outlined'
              disabled={!isSaveButtonEnabled}
              onClick={() => handleSave()}
              fullWidth
            >
              Save
            </Button>
          </Box>
          {isResetButtonEnabled && (
            <Box>
              <Button
                variant='outlined'
                onClick={() => handleReset()}
                fullWidth
              >
                Reset
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </ListItem>
  );
};

export default TranslationField;
