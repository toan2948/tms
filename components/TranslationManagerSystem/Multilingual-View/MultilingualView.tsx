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
  TextField,
} from "@mui/material";
import React from "react";

import { SelectChangeEvent } from "@mui/material/Select";
import { useFileNameStore } from "@/store/useFileNameStore";
import { SessionDialog } from "./Dialogs/SessionDialog";
import TreeView from "./TreeView/TreeView";
import AllChangesView from "./AllChangesVew/AllChangesView";
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

  const [seeAllChanges, setSeeAllChanges] = React.useState(false);

  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <>
      <SessionDialog open={openDialog} onClose={setOpenDialog} />
      <Stack direction={"row"} justifyContent={"space-between"}>
        <FormControl
          sx={{
            width: "20%",
            marginBottom: "20px",
            visibility: !seeAllChanges ? "visible" : "hidden",
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
        <FormControl
          sx={{
            width: "20%",
            marginBottom: "20px",
          }}
        >
          <InputLabel id='demo-simple-select-label'></InputLabel>
          <TextField>Add Key</TextField>
        </FormControl>

        <Box>
          <Button
            variant='contained'
            onClick={() => {
              setSeeAllChanges(!seeAllChanges);
            }}
            sx={{
              marginRight: "10px",
              backgroundColor: "#4caf50",
            }}
          >
            {!seeAllChanges ? "See All Changes " : "See Tree View"}
          </Button>
          <Button onClick={() => setOpenDialog(true)} variant='contained'>
            Save Session
          </Button>
        </Box>
      </Stack>
      {seeAllChanges ? (
        <AllChangesView setSeeAllChanges={setSeeAllChanges} />
      ) : (
        <TreeView />
      )}
    </>
  );
};

export default MultilingualView;
