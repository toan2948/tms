"use client";
import RedOutlineButton from "@/components/ui/RedOutlineButton";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { useUserStore } from "@/store/useUserStore";
import { useViewStore } from "@/store/useViewStore";
import { fetchAllTranslationFiles } from "@/utils/languages/dataFunctions";
import { isDevOrAdmin } from "@/utils/languages/login";
import { Button, Stack } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  useEffect(() => {
    // Prefetch the import page to improve performance when navigating
    router.prefetch?.("/import");
  }, [router]);
  const { setFilesInfo } = useAllKeyFileStore();
  const [openResetAllChangesDialog, setOpenResetAllChangesDialog] =
    useState(false);

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
        <Stack
          direction={"row"}
          alignItems={"center"}
          sx={{ marginBottom: "20px" }}
        >
          <FileSelection />
          <Button component={Link} href='/import' prefetch variant='contained'>
            Import Files
          </Button>
        </Stack>

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
