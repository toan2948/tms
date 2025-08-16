"use client";
import RedOutlineButton from "@/components/ui/RedOutlineButton";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { useUserStore } from "@/store/useUserStore";
import { useViewStore } from "@/store/useViewStore";
import {
  fetchAllTranslationFiles,
  fetchLanguages,
} from "@/utils/languages/dataFunctions";
import { isDevOrAdmin } from "@/utils/languages/login";
import { Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import ChangeViewButtons from "../InteractComp/ChangeViewButtons";
import FileSelection from "../InteractComp/FileSelection";
import LanguageSelection from "../InteractComp/LanguageSelection";
import { AddKeyField } from "./AddKeyField";
import AllChangesView from "./AllChangesVew/AllChangesView";
import { DeleteDialog } from "./Dialogs/Delete/DeleteDialog";
import { SessionDialog } from "./Dialogs/Session/SessionDialog";
import TreeView from "./TreeView/TreeView";

const MultilingualView = () => {
  const { seeAllChanges } = useOtherStateStore();
  const [openDialog, setOpenDialog] = React.useState(false);
  const { multiViewState } = useViewStore();
  const { user } = useUserStore();
  const { setSelectedTreeKey } = useTreeKeyStore();

  const { setFilesInfo, setLanguages } = useAllKeyFileStore();
  const [openResetAllChangesDialog, setOpenResetAllChangesDialog] =
    useState(false);

  //fetch languages
  useEffect(() => {
    async function fetchLanguagesFromDB() {
      // This function can be used to fetch languages if needed
      // Currently, it is not used in this component
      const data = await fetchLanguages();
      localStorage.setItem("languages", JSON.stringify(data));
      setLanguages(data);
    }
    fetchLanguagesFromDB();
  }, []);

  const resetChanges = async () => {
    // localStorage.removeItem("filesStorage");
    try {
      const data = await fetchAllTranslationFiles();

      setFilesInfo(data);
    } catch (error) {
      console.error("Error loading translation data:", error);
    }
    setSelectedTreeKey(null);
    setOpenResetAllChangesDialog(false);
  };

  return (
    <>
      <SessionDialog open={openDialog} onClose={setOpenDialog} />
      <DeleteDialog
        handleDelete={resetChanges}
        open={openResetAllChangesDialog}
        setOpen={setOpenResetAllChangesDialog}
        title=' discard all changes in this session?'
        warning={false}
        actionText='yes, reset all'
      />
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <FileSelection />
        {/* switch between multi and bilingual views */}
        {multiViewState ? (
          seeAllChanges ? (
            <RedOutlineButton
              onClick={() => setOpenResetAllChangesDialog(true)}
            >
              Reset Changes
            </RedOutlineButton>
          ) : (
            isDevOrAdmin(user?.role) && <AddKeyField />
          )
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
