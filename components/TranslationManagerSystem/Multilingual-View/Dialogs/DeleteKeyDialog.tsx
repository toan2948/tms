import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import { Typo1624 } from "@/components/ui/StyledElementPaymentDetail";
import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { deleteTranslationKey } from "@/utils/languages/dataFunctions";
import { toast } from "react-toastify";

export interface DeleteKeyDialogProps {
  open: boolean;
  setOpenDeleteKeyDialog: Dispatch<SetStateAction<boolean>>;
}

export function DeleteKeyDialog({
  open,
  setOpenDeleteKeyDialog,
}: DeleteKeyDialogProps) {
  const { removeKeyFromTree, selectedTreeKey, setSelectedTreeKey } =
    useTreeKeyStore();
  const { fileNameState } = useFileNameStore();
  const { removeKeyFromFilesInfo } = useAllKeyFileStore();
  const handleClose = () => {
    setOpenDeleteKeyDialog(false);
  };

  const handleDelete = async () => {
    if (selectedTreeKey?.isNew) {
      removeKeyFromTree(selectedTreeKey.id, fileNameState);
      localStorage.removeItem("DBkeys"); // Clear the local storage cache
      removeKeyFromFilesInfo(selectedTreeKey);
    } else {
      await deleteTranslationKey(
        selectedTreeKey?.full_key_path ? selectedTreeKey.full_key_path : "",
        fileNameState
      );
      removeKeyFromTree(
        selectedTreeKey?.id ? selectedTreeKey?.id : "",
        fileNameState
      );

      localStorage.removeItem("DBkeys"); // Clear the local storage cache
      localStorage.removeItem("translationEdits");
    }

    setOpenDeleteKeyDialog(false);
    // if (!selectedTreeKey?.id) {
    //   toast.error("Key ID is missing, cannot delete key.");
    // }
    setSelectedTreeKey(null); // Reset selected key ID after deletion

    toast.success("the key is deleted!");
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle textAlign={"center"}>Delete Key</DialogTitle>
      <Box
        sx={{
          padding: "10px",
        }}
      >
        <Typography sx={{ padding: "10px" }} component='span'>
          Are you sure to delete this key:
        </Typography>
        <Typo1624 color='red'>{selectedTreeKey?.full_key_path}</Typo1624>
        <Stack direction={"row"} justifyContent={"flex-end"}>
          <Button
            variant='outlined'
            sx={{
              marginRight: "10px",
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant={"outlined"}
            sx={{
              marginRight: "10px",
              marginLeft: "10px",
              color: "red",
              borderColor: "red", // <-- this is key for the outline
              "&:hover": {
                backgroundColor: "rgba(255, 0, 0, 0.04)", // subtle red on hover
                borderColor: "red",
              },
            }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
