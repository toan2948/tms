import * as React from "react";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import { deleteTranslationKey } from "@/utils/languages/dataFunctions";
import { toast } from "react-toastify";
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";
import { Typo1624 } from "@/components/ui/StyledElementPaymentDetail";

export interface DeleteKeyDialogProps {
  open: boolean;
  setOpenDeleteKeyDialog: Dispatch<SetStateAction<boolean>>;
  selectedKey: string;
  setSelectedKeyID: Dispatch<SetStateAction<string>>;
}

export function DeleteKeyDialog({
  open,
  setOpenDeleteKeyDialog,
  selectedKey,
  setSelectedKeyID,
}: DeleteKeyDialogProps) {
  const { removeKeyFromTree, selectedTreeKey } = useKeyStore();
  const { fileNameState } = useFileNameStore();
  const handleClose = () => {
    setOpenDeleteKeyDialog(false);
  };

  const handleDelete = async () => {
    await deleteTranslationKey(
      selectedTreeKey?.full_key_path ? selectedTreeKey.full_key_path : "",
      fileNameState
    );
    setOpenDeleteKeyDialog(false);
    removeKeyFromTree(selectedKey, fileNameState); // Remove key from the tree in the store
    setSelectedKeyID(""); // Reset selected key ID after deletion
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
