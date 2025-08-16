import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import { useTreeKeyStore } from "@/store/useTreeKeyStore";

export interface DeleteKeyDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  handleDelete: () => Promise<void>;
  warning?: boolean;
  title: string;
  actionText?: string;
}

export function DeleteDialog({
  open,
  setOpen: setOpen,
  handleDelete,
  title,
  warning,
  actionText,
}: DeleteKeyDialogProps) {
  const { selectedTreeKey } = useTreeKeyStore();

  const handleClose = () => {
    setOpen(false);
  };

  // useEffect(() => {

  // }, []);

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle textAlign={"center"}> {title}</DialogTitle>
      <Box
        sx={{
          padding: "10px",
        }}
      >
        {selectedTreeKey?.has_children && warning ? (
          <Typography color='red' sx={{ padding: "10px" }} component='span'>
            Warning: delete the key {selectedTreeKey?.full_key_path} will delete
            all of its children.
          </Typography>
        ) : (
          <>
            <Typography sx={{ padding: "10px" }} component='span'>
              Are you sure you want to {title}
            </Typography>
            {/* <Typo1624 color='red'>{selectedTreeKey?.full_key_path}</Typo1624> */}
          </>
        )}

        <Stack
          direction={"row"}
          justifyContent={"flex-end"}
          sx={{ marginTop: "20px" }}
        >
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
            {actionText || "Delete"}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
