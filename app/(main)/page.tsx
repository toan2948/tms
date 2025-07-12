"use client";
import BilingualView from "@/components/TranslationManagerSystem/BilingualView/BilingualView";
import MultilingualView from "@/components/TranslationManagerSystem/Multilingual-View/MultilingualView";
import { Box, Stack, ButtonGroup, Button } from "@mui/material";
import React, { useState } from "react";

function HomePage() {
  const [multiView, setMultilingualView] = useState<boolean>(true);
  return (
    <Box sx={{ padding: "20px 20px 20px 20px", width: "100%", height: "100%" }}>
      <h1>Translation Panel</h1>

      <Stack sx={{ width: "100%", marginBottom: "20px", alignItems: "center" }}>
        <ButtonGroup aria-label='Basic button group'>
          <Button
            variant={multiView ? "contained" : "outlined"}
            onClick={() => setMultilingualView(true)}
          >
            Multilingual View
          </Button>
          <Button
            variant={!multiView ? "contained" : "outlined"}
            onClick={() => setMultilingualView(false)}
          >
            Bilingual View
          </Button>
        </ButtonGroup>
      </Stack>
      {multiView ? <MultilingualView /> : <BilingualView />}
    </Box>
  );
}

export default HomePage;
