"use client";
import { Typo1424, Typo1624 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { KeyState } from "@/types/translation";
import { normalizeEmpty } from "@/utils/languages/processData";
import {
  Box,
  Button,
  Grid,
  ListItem,
  Paper,
  Stack,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ResetDialog } from "../../Dialogs/ResetDialog";
type TranslationFieldProps = {
  index: number;
  data: KeyState;
  bilingual?: boolean;
};
const TranslationField = ({ index, data }: TranslationFieldProps) => {
  const [enableSaveButton, setEnableSaveButton] = useState(false);
  const [value, setValue] = useState(data.value);
  const [openResetDialog, setOpenResetDialog] = React.useState(false);

  const { selectedTreeKey } = useTreeKeyStore();
  const { updateKeyChanged } = useAllKeyFileStore();

  //**notice: localStorage is not defined in server-side rendering
  // const localStorageDBValues = useMemo(() => {
  //   return localStorage.getItem("currentDBvalues")
  //     ? JSON.parse(localStorage.getItem("currentDBvalues") as string)
  //     : [];
  // }, [data]);

  // console.log("TranslationField data:", data);

  const [isResetButtonEnabled, setIsResetButtonEnabled] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    setEnableSaveButton(true);
  };
  const handleSave = () => {
    updateKeyChanged({
      full_key_path: selectedTreeKey?.full_key_path
        ? selectedTreeKey.full_key_path
        : "",
      id: data.id,
      isChanged: true,
      value: value,
      version: data.version,
      last_edited_at: new Date(),
      has_children: data.has_children,
      parent_id: data.parent_id,
      notes: data.notes,
      old_version: data.old_version, // Store the old version to do comparison
      old_value: data.old_value, // Store the old value to do comparison
      key_path_segment: data.key_path_segment,
      level: data.level,
      language_code: data.language_code,
      language_name: data.language_name,
      file_id: data.file_id,
      fileName: data.fileName,
      isNew: data.isNew,
    });
    setEnableSaveButton(false);
    setIsResetButtonEnabled(true);
    //value state is temporally not set here
  };

  useEffect(() => {
    if (value === data.old_value) {
      setEnableSaveButton(false);
    }
  }, [value]);
  useEffect(() => {
    //set the initial value for the value state
    setValue(data.value ?? "");
  }, [data.value]);

  useEffect(() => {
    if (normalizeEmpty(data.old_value) !== normalizeEmpty(data.value)) {
      //set the reset button at initial render
      setIsResetButtonEnabled(true);
    } else {
      setIsResetButtonEnabled(false);
    }
  }, [data]);

  return (
    <>
      <ResetDialog
        data={data}
        open={openResetDialog}
        onClose={setOpenResetDialog}
        setValue={setValue}
        setIsSaveButtonEnabled={setEnableSaveButton}
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
                <Typo1624 color={"red"}>{data.old_value}</Typo1624>
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
                disabled={!enableSaveButton}
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
