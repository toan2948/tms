import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { Box } from "@mui/material";
import React from "react";

interface TranslationTableProps {
  translations: { id: number; source: string; target: string }[];
}

const TranslationTable: React.FC<TranslationTableProps> = ({}) => {
  return (
    <Box>
      <Box>
        <Typo1424>Home</Typo1424>
      </Box>
      <Box></Box>
    </Box>
  );
};

export default TranslationTable;
