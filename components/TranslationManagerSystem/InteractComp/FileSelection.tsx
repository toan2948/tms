import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useEffect, useMemo } from "react";

const FileSelection = () => {
  const { seeAllChanges, files } = useOtherStateStore();
  const { setSelectedTreeKey, fileNameState, setFileName } = useTreeKeyStore();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedTreeKey(null); // Reset selected key when changing file

    setFileName(event.target.value as string);
  };

  const reducedFiles = useMemo(
    () => [...new Set(files.map((item) => item.fileName))],
    [files]
  );

  useEffect(() => {
    console.log("fileNameState", fileNameState);
  }, [fileNameState, setFileName]);

  return (
    <FormControl
      sx={{
        width: "250px",
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
        {reducedFiles.map((name, index) => (
          <MenuItem key={index} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FileSelection;
