"use client";
import MultilingualView from "@/components/TranslationManagerSystem/Multilingual-View/MultilingualView";
import { useUserStore } from "@/store/useUserStore";
import { useViewStore } from "@/store/useViewStore";
import { getUser } from "@/utils/languages/login";
import { Box, Button, ButtonGroup, Stack } from "@mui/material";
import { useEffect } from "react";

function HomePage() {
  const { multiViewState, setView } = useViewStore();

  const { setUser } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      const profile = await getUser();
      console.log("Fetching user data...", profile);
      setUser(profile);
    };

    fetchUser();
  }, []);
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
      <MultilingualView />
    </Box>
  );
}

export default HomePage;
