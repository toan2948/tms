import { useOtherStateStore } from "@/store/useOtherStateStore";
import { Box, Button, Stack } from "@mui/material";
import React from "react";
import FileSelection from "../InteractComp/FileSelection";
import LanguageSelection from "../InteractComp/LanguageSelection";
import AllChangesView from "../Multilingual-View/AllChangesVew/AllChangesView";
import { SessionDialog } from "../Multilingual-View/Dialogs/Session/SessionDialog";
import TreeView from "../Multilingual-View/TreeView/TreeView";
const BilingualView = () => {
  const { seeAllChanges, setSeeAllChanges } = useOtherStateStore();
  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <>
      <SessionDialog
        open={openDialog}
        onClose={setOpenDialog}
        setSeeAllChanges={setSeeAllChanges}
      />
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <FileSelection />
        <LanguageSelection />
        <Box>
          <Button
            variant='contained'
            onClick={() => {
              setSeeAllChanges();
            }}
            sx={{
              marginRight: "10px",
              backgroundColor: "#4caf50",
            }}
          >
            {!seeAllChanges ? "See All Changes " : "See Tree View"}
          </Button>
          <Button onClick={() => setOpenDialog(true)} variant='contained'>
            Save Session
          </Button>
        </Box>
      </Stack>
      <Box>
        {seeAllChanges ? (
          <AllChangesView setSeeAllChanges={setSeeAllChanges} />
        ) : (
          <TreeView />
        )}
      </Box>
    </>
  );
};

export default BilingualView;
