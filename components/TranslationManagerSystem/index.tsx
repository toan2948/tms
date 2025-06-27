"use client";
import { Box, Stack, styled, Button, ButtonGroup } from "@mui/material";
import { useState } from "react";
import BilingualView from "./BilingualView/BilingualView";
import MultilingualView from "./Multilingual-View/MultilingualView";
import { TranslationTreeKey } from "@/types/translation";
export const HeaderBox = styled(Stack)(({}) => ({
  width: "100%",
  borderBottom: "solid 1px black",
  maxHeight: "50px",
  minHeight: "50px",
  alignItems: "center",
  justifyContent: "center",
}));

export type TranslationPageProps = {
  data: TranslationTreeKey[];
};

const TranslationPage = ({ data }: TranslationPageProps) => {
  const [multiView, setMultilingualView] = useState<boolean>(true);
  return (
    <Box sx={{ padding: "20px 20px 20px 20px", width: "100%", height: "100%" }}>
      <h1>Translation Panel</h1>
      <Stack sx={{ width: "100%", marginBottom: "20px", alignItems: "center" }}>
        <ButtonGroup variant='contained' aria-label='Basic button group'>
          <Button onClick={() => setMultilingualView(true)}>
            Multilingual View
          </Button>
          <Button onClick={() => setMultilingualView(false)}>
            Bilingual View
          </Button>
        </ButtonGroup>
      </Stack>
      {multiView ? <MultilingualView data={data} /> : <BilingualView />}
    </Box>
  );
};

export default TranslationPage;
