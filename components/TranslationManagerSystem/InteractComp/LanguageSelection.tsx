import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
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

const LanguageSelection = () => {
  const { languages } = useAllKeyFileStore();

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
    <Stack direction={"row"} alignItems={"center"}>
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
            {languages.map((lang) => (
              <MenuItem key={lang.language_id} value={lang.language_name}>
                {lang.language_name}
              </MenuItem>
            ))}
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
            {languages.map((lang) => (
              <MenuItem key={lang.language_id} value={lang.language_name}>
                {lang.language_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
};

export default LanguageSelection;
