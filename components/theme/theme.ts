import { createTheme } from "@mui/material/styles";
import { enUS, zhCN, zhTW } from "@mui/x-data-grid/locales";
import { createComponents } from "./components";
import { darkPalette, lightPalette } from "./palette";
import { createShadows } from "./shadows";
import { createTypography } from "./typography";
import { TLocale } from "@/lib/i18n/languages";

export function getGridLocale(locale?: TLocale) {
  switch (locale) {
    case "en-US":
      return enUS;
    case "zh-TW":
      return zhTW;
    case "zh-CN":
      return zhCN;
    default:
      return enUS;
  }
}

export const createCustomTheme = (dark?: boolean, locale?: TLocale) =>
  createTheme(
    {
      palette: !dark ? darkPalette : lightPalette,
      typography: createTypography(dark),
      shadows: createShadows(),
      components: createComponents(dark),
    },
    getGridLocale(locale)
  );
