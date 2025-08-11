import EditableTextFieldWithSave from "@/components/ui/EditTextField";
import RedOutlineButton from "@/components/ui/RedOutlineButton";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { useUserStore } from "@/store/useUserStore";
import { editNote } from "@/utils/languages/editNote";
import { isDevOrAdmin } from "@/utils/languages/login";
import { Box, Button, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { DeleteDialog } from "../../Dialogs/Delete/DeleteDialog";

const Note = () => {
  const { selectedTreeKey, setSelectedTreeKey, fileNameState } =
    useTreeKeyStore();
  const { user } = useUserStore();
  const { updateKeyNoteInFilesInfo } = useAllKeyFileStore();

  const [openAddNotesField, setOpenAddNotesField] = useState(false);
  const [openDeleteNoteDialog, setOpenDeleteNoteDialog] = useState(false);

  const [showHelperText, setShowHelperText] = useState(false);
  const [error, setError] = useState(false);
  const [noteState, setNoteState] = useState(selectedTreeKey?.notes || "");

  const [isNoteEmpty, setNoteEmpty] = useState(false);

  const handleDeleteNote = async () => {
    if (selectedTreeKey === null) return;

    const deleteSuccess = await editNote(selectedTreeKey.id, "", true);
    if (deleteSuccess) {
      setSelectedTreeKey({ ...selectedTreeKey, notes: null }); // Update the selectedTreeKey with the new note
      updateKeyNoteInFilesInfo(
        selectedTreeKey.full_key_path,
        null,
        fileNameState
      );
      setOpenAddNotesField(false); // Close the edit field after saving}
      setOpenDeleteNoteDialog(false); // Close the delete dialog
      setNoteState(""); // Clear the note state
    }
  };

  const handleEditNote = async () => {
    if (selectedTreeKey === null) return;
    const trimmedNote = noteState.trim();

    //If add or edit note, we will proceed with the note editing
    // const isValid = /^[a-zA-Z0-9_]*$/.test(trimmedKey);
    if (!trimmedNote) {
      setNoteEmpty(true);
      setError(true);
      setShowHelperText(true);
      setTimeout(() => {
        setShowHelperText(false);
        setError(false);
      }, 3000);
      return;
    }

    const editSuccess = await editNote(selectedTreeKey.id, trimmedNote);

    if (editSuccess) {
      setSelectedTreeKey({ ...selectedTreeKey, notes: trimmedNote }); // Update the selectedTreeKey with the new note
      updateKeyNoteInFilesInfo(
        selectedTreeKey.full_key_path,
        trimmedNote,
        fileNameState
      );
      setOpenAddNotesField(false); // Close the edit field after saving}
    } else {
      setNoteEmpty(false);
      setError(true);
      setShowHelperText(true);
      setTimeout(() => {
        setShowHelperText(false);
        setError(false);
      }, 3000);
    }
  };
  useEffect(() => {
    setNoteState(selectedTreeKey?.notes || ""); // Update noteState when selectedTreeKey changes
    setOpenAddNotesField(false); // Reset the open state when selectedTreeKey changes
  }, [selectedTreeKey]);
  return (
    <Box
      sx={{
        height: "70px",
      }}
    >
      <DeleteDialog
        handleDelete={handleDeleteNote}
        open={openDeleteNoteDialog}
        setOpen={setOpenDeleteNoteDialog}
        title='delete this Note'
        warning={false}
      />
      <Stack direction={"column"}>
        <Typo1424 weight={500}>Note: {selectedTreeKey?.notes}</Typo1424>
        {isDevOrAdmin(user?.role) && !openAddNotesField && (
          <Stack direction={"row"} alignItems={"center"}>
            <Button
              variant={"outlined"}
              sx={{ marginRight: "10px" }}
              onClick={() => setOpenAddNotesField(true)}
            >
              {selectedTreeKey?.notes ? "Edit Notes" : "Add Notes"}
            </Button>

            {selectedTreeKey?.notes && (
              <RedOutlineButton onClick={() => setOpenDeleteNoteDialog(true)}>
                Delete Note
              </RedOutlineButton>
            )}
          </Stack>
        )}
      </Stack>
      <Stack direction={"row"} justifyContent={"center"} alignItems={"center"}>
        <EditableTextFieldWithSave
          value={noteState}
          onChange={setNoteState}
          onSave={handleEditNote}
          show={openAddNotesField}
          error={error}
          helperText={
            showHelperText
              ? isNoteEmpty
                ? "Note is empty"
                : "Can not edit the note"
              : ""
          }
        />

        <Button
          variant='contained'
          onClick={() => setOpenAddNotesField(false)}
          sx={{
            marginLeft: "10px",
            display: openAddNotesField ? "block" : "none", // ✅ hide instead of unmount
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

export default Note;
