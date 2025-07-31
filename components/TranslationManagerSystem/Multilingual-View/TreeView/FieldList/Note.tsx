import EditableTextFieldWithSave from "@/components/ui/EditTextField";
import RedOutlineButton from "@/components/ui/RedOutlineButton";
import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { editNote } from "@/utils/languages/editNote";
import { Button, Stack } from "@mui/material";
import { useState } from "react";

const Note = () => {
  const [openAddNotesField, setOpenAddNotesField] = useState(false);
  const { selectedTreeKey, setSelectedTreeKey } = useTreeKeyStore();
  const [showHelperText, setShowHelperText] = useState(false);
  const [error, setError] = useState(false);
  const { fileNameState } = useFileNameStore();
  const [noteState, setNoteState] = useState(selectedTreeKey?.notes || "");

  const { updateKeyNoteInFilesInfo } = useAllKeyFileStore();

  const [isNoteEmpty, setNoteEmpty] = useState(false);

  const handleEditNote = async (deleteIt?: boolean) => {
    if (selectedTreeKey === null) return;
    const trimmedKey = noteState.trim();

    // If deleteIt is true, we will delete the note
    if (deleteIt) {
      const deleteSuccess = await editNote(selectedTreeKey.id, "", true);
      if (deleteSuccess) {
        setSelectedTreeKey({ ...selectedTreeKey, notes: null }); // Update the selectedTreeKey with the new note
        updateKeyNoteInFilesInfo(
          selectedTreeKey.full_key_path,
          null,
          fileNameState
        );
        setOpenAddNotesField(false); // Close the edit field after saving}
      }
      return;
    }

    //If add or edit note, we will proceed with the note editing
    // const isValid = /^[a-zA-Z0-9_]*$/.test(trimmedKey);
    if (!trimmedKey) {
      setNoteEmpty(true);
      setError(true);
      setShowHelperText(true);
      setTimeout(() => {
        setShowHelperText(false);
        setError(false);
      }, 3000);
      return;
    }

    const editSuccess = await editNote(selectedTreeKey.id, trimmedKey);

    if (editSuccess) {
      setSelectedTreeKey({ ...selectedTreeKey, notes: trimmedKey }); // Update the selectedTreeKey with the new note
      updateKeyNoteInFilesInfo(
        selectedTreeKey.full_key_path,
        trimmedKey,
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
  return (
    <>
      <Stack direction={"row"} alignItems={"center"} gap={"10px"}>
        <Typo1424 weight={500}>
          {selectedTreeKey?.notes || "No notes available"}
        </Typo1424>
        {!openAddNotesField && (
          <Stack direction={"column"} alignItems={"center"}>
            <Button
              variant={"outlined"}
              sx={{ marginRight: "10px" }}
              onClick={() => setOpenAddNotesField(true)}
            >
              {selectedTreeKey?.notes ? "Edit Notes" : "Add Notes"}
            </Button>
            <RedOutlineButton onClick={() => handleEditNote(true)}>
              Delete Note
            </RedOutlineButton>
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
    </>
  );
};

export default Note;
