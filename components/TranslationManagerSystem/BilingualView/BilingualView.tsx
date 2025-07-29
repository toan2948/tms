import { useViewStore } from "@/store/useViewStore";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import React from "react";
import AllChangesView from "../Multilingual-View/AllChangesVew/AllChangesView";
import TreeView from "../Multilingual-View/TreeView/TreeView";
const BilingualView = () => {
  // const [source, setSource] = React.useState("");
  // const [target, setTarget] = React.useState("");

  const [seeAllChanges, setSeeAllChanges] = React.useState(false);
  const {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
  } = useViewStore();

  const handleChangeSource = (event: SelectChangeEvent) => {
    setSourceLanguage(event.target.value as string);
  };

  const handleChangeTarget = (event: SelectChangeEvent) => {
    setTargetLanguage(event.target.value as string);
  };

  return (
    <>
      <Stack>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          alignSelf={"center"}
          width={"35%"}
        >
          <Box>
            <FormControl fullWidth>
              <InputLabel id='demo-simple-select-label1'>
                Source Language
              </InputLabel>
              <Select
                value={sourceLanguage}
                label='Source Language'
                onChange={handleChangeSource}
                sx={{ width: "200px" }}
              >
                <MenuItem value='English'>English</MenuItem>
                <MenuItem value='Chinese'>Chinese</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <DoubleArrowIcon />
          <Box>
            <FormControl fullWidth>
              <InputLabel id='demo-simple-select-label2'>
                Target Language
              </InputLabel>
              <Select
                value={targetLanguage}
                label='Target Language'
                onChange={handleChangeTarget}
                sx={{ width: "200px" }}
              >
                <MenuItem value='Russian'>Russian</MenuItem>
                <MenuItem value='Spanish'>Spain</MenuItem>
                <MenuItem value='Chinese'>Chinese</MenuItem>
                <MenuItem value='English'>Chinese</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Stack>
      <Box sx={{ marginTop: "10px" }}>
        {seeAllChanges ? (
          <AllChangesView setSeeAllChanges={setSeeAllChanges} />
        ) : (
          <TreeView />
        )}
      </Box>
    </>
  );
};

export default BilingualView;
