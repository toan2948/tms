"use client";

import BilingualView from "@/components/TranslationManagerSystem/BilingualView/BilingualView";
import MultilingualView from "@/components/TranslationManagerSystem/Multilingual-View/MultilingualView";
import { Box, Stack, ButtonGroup, Button } from "@mui/material";

import React, { useState } from "react";

function TPage() {
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
      {multiView ? <MultilingualView /> : <BilingualView />}
    </Box>
  );
}

export default TPage;
