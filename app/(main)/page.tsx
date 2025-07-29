"use client";
import BilingualView from "@/components/TranslationManagerSystem/BilingualView/BilingualView";
import MultilingualView from "@/components/TranslationManagerSystem/Multilingual-View/MultilingualView";
import { useViewStore } from "@/store/useViewStore";
import { Box, Button, ButtonGroup, Stack } from "@mui/material";

function HomePage() {
  const { multiViewState, setView } = useViewStore();
  return (
    <Box sx={{ padding: "20px 20px 20px 20px", width: "100%", height: "100%" }}>
      <h1>Translation Panel</h1>

      <Stack sx={{ width: "100%", marginBottom: "20px", alignItems: "center" }}>
        <ButtonGroup aria-label='Basic button group'>
          <Button
            variant={multiViewState ? "contained" : "outlined"}
            onClick={() => setView(true)}
          >
            Multilingual View
          </Button>
          <Button
            variant={!multiViewState ? "contained" : "outlined"}
            onClick={() => setView(false)}
          >
            Bilingual View
          </Button>
        </ButtonGroup>
      </Stack>
      {/* <MultilingualView /> */}
      {multiViewState ? <MultilingualView /> : <BilingualView />}
    </Box>
  );
}

export default HomePage;
