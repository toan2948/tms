import { Box, Button, Stack, styled, Typography } from "@mui/material";

export const PaymentTopStack = styled(Stack)(({}) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const ColumnStack = styled(Stack)(({}) => ({
  flexDirection: "column",
}));

export const RowStack = styled(Stack)(({}) => ({
  flexDirection: "row",
  alignItems: "center",
}));

export const PaymentStatusStack = styled(Stack)(({}) => ({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#EBFFF1",
  paddingLeft: "4px",
  paddingRight: "4px",
  borderRadius: "6px",
  marginLeft: "4px",
  gap: "4px",
}));

export const RefundButton = styled(Button)(({}) => ({
  color: "#666666",
  fontSize: "12px",
  fontWeight: "500",
  lineHeight: "16px",
  padding: "4px 6px 4px 12px",
  borderRadius: "4px",
  border: "1px solid #E1E2E4",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
}));

interface ColumnBoxLeftBorderProps {
  index: number;
}

export const ColumnBoxLeftBorder = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "index",
})<ColumnBoxLeftBorderProps>(({ theme, index }) => {
  return {
    flexDirection: "column",
    gap: "2px",
    paddingRight: "33px",
    paddingLeft: index > 0 ? "16px" : "0px",
    borderLeft:
      index > 0 ? "1px solid" + theme.palette.innerAlignment.main : "none",
  };
});

export const RiskNumberBox = styled(Box)(({}) => ({
  backgroundColor: "#FFFCC2",
  borderRadius: "50%",
  height: "24px",
  width: "24px",
  color: "#3B8E3A",
  fontSize: "14px",
  fontWeight: "500",
  lineHeight: "24px",
}));

export const TypoRiskNumber = styled(Typography)(({}) => ({
  textAlign: "center",
  fontWeight: 600,
  lineHeight: "24px",
  color: "#835101",
  fontSize: "14px",
}));

interface TypoProps {
  weight?: number;
}

export const Typo1424 = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "weight",
})<TypoProps>(({ weight }) => {
  return {
    lineHeight: "24px",
    fontSize: "14px",
    fontWeight: weight ?? 400,
  };
});

export const Typo1624 = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "weight",
})<TypoProps>(({ weight }) => {
  return {
    lineHeight: "24px",
    fontSize: "16px",
    fontWeight: weight ?? 400,
  };
});

export const Typo1224 = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "weight",
})<TypoProps>(({ weight }) => {
  return {
    lineHeight: "24px",
    fontSize: "12px",
    fontWeight: weight ?? 400,
  };
});
