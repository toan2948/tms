"use client";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled,
} from "@mui/material";
import React from "react";

import { SelectChangeEvent } from "@mui/material/Select";
import { useFileNameStore } from "@/store/useFileNameStore";
import { SessionDialog } from "./SessionDialog/SessionDialog";
import TreeView from "./TreeView";
export const HeaderBox = styled(Stack)(({}) => ({
  width: "100%",
  borderBottom: "solid 1px black",
  maxHeight: "50px",
  minHeight: "50px",
  alignItems: "center",
  justifyContent: "center",
}));
const MultilingualView = () => {
  const { fileNameState, change } = useFileNameStore();

  const handleChange = (event: SelectChangeEvent) => {
    change(event.target.value as string);
  };

  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <>
      <SessionDialog open={openDialog} onClose={setOpenDialog} />
      <Stack direction={"row"} justifyContent={"space-between"}>
        <FormControl
          sx={{
            width: "20%",
            marginBottom: "20px",
          }}
        >
          <InputLabel id='demo-simple-select-label'>filename</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={fileNameState}
            label='filename'
            onChange={handleChange}
          >
            <MenuItem value={"common"}>Common</MenuItem>
            <MenuItem value={"movie"}>Movie</MenuItem>
          </Select>
        </FormControl>
        <Box>
          <Button
            variant='contained'
            onClick={() => {}}
            sx={{
              marginRight: "10px",
            }}
          >
            See All Changes
          </Button>
          <Button onClick={() => setOpenDialog(true)} variant='contained'>
            Save Session
          </Button>
        </Box>
      </Stack>
      <TreeView />
    </>
  );
};

export default MultilingualView;
