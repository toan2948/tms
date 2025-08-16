"use client";
import MultilingualView from "@/components/TranslationManagerSystem/Multilingual-View/MultilingualView";
import { Typo1624 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useUserStore } from "@/store/useUserStore";
import { useViewStore } from "@/store/useViewStore";
import { fetchLanguages } from "@/utils/languages/dataFunctions";
import { getProfile } from "@/utils/languages/login";
import { Box, Button, ButtonGroup, Stack } from "@mui/material";
import { useEffect } from "react";
import { signOut } from "../login/actions";

function HomePage() {
  const { multiViewState, setView } = useViewStore();

  const { setUser, user } = useUserStore();

  const { setLanguages } = useAllKeyFileStore();

  const handleSignout = async () => {
    await signOut();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getProfile();
      setUser(profile);
    };
    fetchProfile();
  }, []);

  //fetch languages
  useEffect(() => {
    async function fetchLanguagesFromDB() {
      const data = await fetchLanguages();
      const localData = localStorage.getItem("languages");

      if (localData !== null && localData !== "[]") {
        // console.log("Using data from localStorage");
        const parsedData = JSON.parse(localData);
        setLanguages(parsedData);
      } else {
        setLanguages(data);
      }

      localStorage.setItem("languages", JSON.stringify(data));
      setLanguages(data);
    }

    fetchLanguagesFromDB();
  }, []);

  return (
    <Box sx={{ padding: "20px 20px 20px 20px", width: "100%", height: "100%" }}>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Box>
          {/* <Typo1624>Translation Panel</Typo1624> */}
          <Typo1624>User: {user?.full_name || user?.email}</Typo1624>
        </Box>

        <Button onClick={() => handleSignout()}>Sign out</Button>
      </Stack>

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
