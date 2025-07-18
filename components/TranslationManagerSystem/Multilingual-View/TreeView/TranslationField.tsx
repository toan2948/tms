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
import { Typo1424, Typo1624 } from "@/components/ui/StyledElementPaymentDetail";
import { useKeyStore } from "@/store/useFileNameStore";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { TranslationValue, TranslationValueWithOld } from "@/types/translation";
import { findKeyStateByIdAcrossFiles } from "@/utils/languages/processData";
import { ResetDialog } from "../Dialogs/ResetDialog";
type TranslationFieldProps = {
  index: number;
  data: TranslationValue | TranslationValueWithOld;
  bilingual?: boolean;
};
const TranslationField = ({ index, data }: TranslationFieldProps) => {
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [value, setValue] = useState(data.value);
  const [openResetDialog, setOpenResetDialog] = React.useState(false);

  const { fullKeyPathState: fullKeyPath } = useKeyStore();
  const { updateKeyChanged, DBFilesInfo } = useEditAllFileStore();

  //**notice: localStorage is not defined in server-side rendering
  // const localStorageDBValues = useMemo(() => {
  //   return localStorage.getItem("currentDBvalues")
  //     ? JSON.parse(localStorage.getItem("currentDBvalues") as string)
  //     : [];
  // }, [data]);

  console.log("TranslationField data:", data);

  const DBValue = useMemo(
    () => findKeyStateByIdAcrossFiles(DBFilesInfo, data.id),
    [data.id, DBFilesInfo]
  );

  // console.log("DBValue:, Local/state Data:", DBValue?.value, "/", data.value);
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
      version: data.version,
      last_edited_at: new Date(),
      has_children: data.has_children,
      parent_id: data.parent_id,
    });
    setIsSaveButtonEnabled(false);
    setIsResetButtonEnabled(true);
    //value state is temporally not set here
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
    if (DBValue?.value !== data.value && data.isNew !== true) {
      //set the reset button at initial render
      setIsResetButtonEnabled(true);
    } else {
      setIsResetButtonEnabled(false);
    }
  }, [data.value, DBValue?.value]);

  return (
    <>
      <ResetDialog
        data={data}
        open={openResetDialog}
        onClose={setOpenResetDialog}
        setValue={setValue}
        setIsSaveButtonEnabled={setIsSaveButtonEnabled}
        setIsResetButtonEnabled={setIsResetButtonEnabled}
      />

      <ListItem
        key={index}
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "stretch", // this is CRITICAL
          paddingBottom: "15px",
          paddingTop: "15px",
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
              size={1.5}
              sx={{
                borderRight: "1px solid",
                borderColor: "divider",
                padding: "4px 0px 4px 16px",
              }}
            >
              <Typography>{isResetButtonEnabled && "New"}</Typography>
            </Grid>

            <Grid size={10.5} sx={{ padding: "4px 4px 4px 16px" }}>
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
                size={1.5}
                sx={{
                  borderRight: "1px solid",
                  borderColor: "divider",
                  padding: "0px 0px 4px 16px",
                }}
              >
                <Typography>Old</Typography>
              </Grid>
              <Grid size={10.5} sx={{ padding: "0px 0px 4px 16px" }}>
                <Typo1624 color={"red"}>{DBValue?.value}</Typo1624>
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
                  onClick={() => setOpenResetDialog(true)}
                  fullWidth
                >
                  Reset
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
      </ListItem>
    </>
  );
};

export default TranslationField;
