import {
  Button,
  InputAdornment,
  SxProps,
  TextField,
  TextFieldProps,
} from "@mui/material";
import React from "react";

type EditableTextFieldWithSaveProps = {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  show?: boolean; // controls visibility
  error?: boolean;
  helperText?: string;
  sx?: SxProps; // additional style overrides
  saveLabel?: string; // default: "Save"
} & Omit<TextFieldProps, "onChange" | "value" | "error" | "helperText">;

const EditableTextFieldWithSave: React.FC<EditableTextFieldWithSaveProps> = ({
  value,
  onChange,
  onSave,
  show = true,
  error = false,
  helperText = "",
  sx,
  saveLabel = "Save",
  ...rest
}) => {
  return (
    <TextField
      variant='outlined'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      helperText={helperText}
      sx={{
        display: show ? "block" : "none",
        "& .MuiOutlinedInput-root": {
          padding: "0px 0px 0px 5px",
          height: 40,
        },
        "& .MuiOutlinedInput-input": {
          padding: "0 8px",
          height: "100%",
          display: "flex",
          alignItems: "center",
        },
        ...sx,
      }}
      slotProps={{
        input: onSave
          ? {
              endAdornment: (
                <InputAdornment position='end' sx={{ p: 0 }}>
                  <Button
                    onClick={onSave}
                    disableElevation
                    sx={{
                      borderLeft: "1px solid rgba(0, 0, 0, 0.23)",
                      borderRadius: 0,
                      minWidth: 50,
                      height: 40,
                      m: 0,
                      p: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {saveLabel}
                  </Button>
                </InputAdornment>
              ),
            }
          : undefined,
      }}
      {...rest}
    />
  );
};

export default EditableTextFieldWithSave;
