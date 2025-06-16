import { PaletteOptions } from "@mui/material";

declare module "@mui/material/styles" {
  interface Palette {
    gjwBlue: {
      main: string;
    };
    darkGray: {
      main: string;
    };
    innerAlignment: {
      main: string;
    };
  }
  interface PaletteOptions {
    gjwBlue: {
      main: string;
    };
    darkGray: {
      main: string;
    };
    innerAlignment: {
      main: string;
    };
  }
}

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#1A94FF",
  },
  secondary: {
    main: "#0c1c3e",
  },
  text: {
    primary: "#0C1C3E",
    secondary: "#6E7C87",
  },
  success: {
    main: "#119C2B",
  },
  error: {
    main: "#B83131",
  },
  warning: {
    main: "#B5850B",
  },
  info: {
    main: "#0148BA",
  },
  gjwBlue: {
    main: "#0187FD",
  },
  darkGray: {
    main: "#252C32",
  },
  innerAlignment: {
    main: "#E8EBEF",
  },
};

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#1A94FF",
    contrastText: "#FFF",
  },
  secondary: {
    main: "#FFFFFFBD",
  },
  background: {
    default: "#001D38",
    paper: "#001426",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#C6C6C6",
  },
  gjwBlue: {
    main: "#1A94FF", //todo: need a another color
  },
  darkGray: {
    main: "#FFFFFFBD", //todo: need a another color
  },
  innerAlignment: {
    main: "#FFFFFFBD",
  },
};
