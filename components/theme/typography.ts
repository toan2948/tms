import { TypographyVariantsOptions } from "@mui/material/styles";

export const createTypography = (
  dark?: boolean,
): TypographyVariantsOptions => ({
  caption: {
    color: dark ? "#C6C6C6" : undefined,
  },
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
});
