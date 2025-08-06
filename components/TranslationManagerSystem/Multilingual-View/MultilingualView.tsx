"use client";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useUserStore } from "@/store/useUserStore";
import { useViewStore } from "@/store/useViewStore";
import { isDevOrAdmin } from "@/utils/languages/login";
import { Stack } from "@mui/material";
import React from "react";
import ChangeViewButtons from "../InteractComp/ChangeViewButtons";
import FileSelection from "../InteractComp/FileSelection";
import LanguageSelection from "../InteractComp/LanguageSelection";
import { AddKeyField } from "./AddKeyField";
import AllChangesView from "./AllChangesVew/AllChangesView";
import { SessionDialog } from "./Dialogs/Session/SessionDialog";
import TreeView from "./TreeView/TreeView";

const MultilingualView = () => {
  const { seeAllChanges, setSeeAllChanges } = useOtherStateStore();
  const [openDialog, setOpenDialog] = React.useState(false);
  const { multiViewState } = useViewStore();
  const { user } = useUserStore();

  return (
    <>
      <SessionDialog
        open={openDialog}
        onClose={setOpenDialog}
        setSeeAllChanges={setSeeAllChanges}
      />
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <FileSelection />
        {/* switch between milti and bilingual views */}
        {multiViewState ? (
          isDevOrAdmin(user?.role) && <AddKeyField />
        ) : (
          <LanguageSelection />
        )}
        <ChangeViewButtons setOpenDialog={setOpenDialog} />
      </Stack>
      {seeAllChanges ? <AllChangesView /> : <TreeView />}
    </>
  );
};

export default MultilingualView;
