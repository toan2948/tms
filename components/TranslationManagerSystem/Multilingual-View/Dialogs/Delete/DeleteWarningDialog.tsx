import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

export interface DeleteKeyWarningProps {
  openWarningDialog: boolean;
  setOpenWarningDialog: Dispatch<SetStateAction<boolean>>;
}

export function DeleteWarningDialog({
  openWarningDialog,
  setOpenWarningDialog,
}: DeleteKeyWarningProps) {
  const handleClose = () => {
    setOpenWarningDialog(false);
  };

  return (
    <Dialog onClose={handleClose} open={openWarningDialog}>
      <DialogTitle textAlign={"center"}>Delete Key</DialogTitle>
      <Box
        sx={{
          padding: "10px",
        }}
      >
        <Typography sx={{ padding: "10px" }} component='span'>
          Warning: delete this key will delete all of its children
        </Typography>
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
            onClick={() => {}}
          >
            Delete anyway
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
