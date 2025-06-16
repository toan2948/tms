import { Components, Theme } from "@mui/material";

export const createComponents = (
  dark?: boolean,
): Components<Omit<Theme, "components">> => ({
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: "none",
        "&.MuiButton-outlinedInherit": {
          borderColor: dark ? "#2D3843" : "#E0E3E7",
        },
      },
      sizeLarge: {
        fontSize: "1rem",
        fontWeight: 500,
      },
    },
  },
  MuiTabs: {
    defaultProps: {
      textColor: "secondary",
      indicatorColor: "secondary",
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 400,
        "&.Mui-selected": {
          fontWeight: 600,
        },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        _webkit_transition:
          "border-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        transition:
          "border-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: dark ? "#2D3843!important" : "#E0E3E7!important",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderWidth: "1px!important",
          borderColor: "rgba(26, 148, 255)!important",
          boxShadow: "rgba(26, 148, 255, 0.25) 0 0 0 0.2rem",
        },
        "&.MuiInputBase-sizeSmall": {
          "& .MuiSelect-icon": {
            width: 16,
            height: 16,
            top: "calc(50% - 8px)",
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        "&.MuiChip-outlined": {
          fontWeight: 500,
          borderColor: "transparent",
          backgroundColor: "rgba(66, 66, 66, 0.16)",
          "&.MuiChip-colorPrimary": {
            backgroundColor: "rgba(26, 148, 255, 0.16)",
          },
          "&.MuiChip-colorSuccess": {
            backgroundColor: "rgba(102, 187, 106, 0.16)",
          },
          "&.MuiChip-colorError": {
            backgroundColor: "rgba(211, 47, 47, 0.16)",
          },
          "&.MuiChip-colorWarning": {
            backgroundColor: "rgba(255, 167, 38, 0.16)",
          },
          "&.MuiChip-colorInfo": {
            backgroundColor: "rgba(2, 136, 209, 0.16)",
          },
        },
        "&.MuiChip-sizeSmall": {
          fontSize: 12,
        },
      },
    },
  },
});
