import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

const FileSelection = () => {
  const { seeAllChanges } = useOtherStateStore();
  const { setSelectedTreeKey, fileNameState, setFileName } = useTreeKeyStore();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedTreeKey(null); // Reset selected key when changing file

    setFileName(event.target.value as string);
  };
  return (
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
  );
};

export default FileSelection;
