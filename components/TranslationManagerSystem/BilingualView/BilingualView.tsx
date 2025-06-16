import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Box,
} from "@mui/material";
import React from "react";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import TranslationValueList from "../Multilingual-View/TranslationValueList";
const BilingualView = () => {
  const [source, setSource] = React.useState("");

  const handleChangeSource = (event: SelectChangeEvent) => {
    setSource(event.target.value as string);
  };

  const [target, setTarget] = React.useState("");
  const handleChangeTarget = (event: SelectChangeEvent) => {
    setTarget(event.target.value as string);
  };

  return (
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
              value={source}
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
              value={target}
              label='Target Language'
              onChange={handleChangeTarget}
              sx={{ width: "200px" }}
            >
              <MenuItem value='Russian'>Russian</MenuItem>
              <MenuItem value='Spain'>Spain</MenuItem>
              <MenuItem value='Chinese'>Chinese</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* <TranslationTable /> */}
      </Stack>
      <TranslationValueList
        selectedValue={[
          { key: "greeting", value: "English", lg: "Hello" },
          {
            key: "greeting",
            value: "Chinese",
            lg: " ownership of the component's design, with no Material UI or Joy UI styles to override. This unstyled version of the component is the ideal choice for heavy customization with a smaller bundle size. ",
          },
          { key: "farewell", value: "English", lg: "Goodbye" },
          { key: "farewell", value: "Chinese", lg: "Goes" },
        ]}
      />
    </Stack>
  );
};

export default BilingualView;
