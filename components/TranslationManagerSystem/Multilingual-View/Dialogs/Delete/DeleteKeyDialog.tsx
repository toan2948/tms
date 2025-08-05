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
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { deleteKeyByFullPathAndFileName } from "@/utils/languages/dataFunctions";
import { toast } from "react-toastify";

export interface DeleteKeyDialogProps {
  open: boolean;
  setOpenDeleteKeyDialog: Dispatch<SetStateAction<boolean>>;
}

export function DeleteKeyDialog({
  open,
  setOpenDeleteKeyDialog,
}: DeleteKeyDialogProps) {
  // const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const {
    removeKeyFromTree,
    selectedTreeKey,
    setSelectedTreeKey,
    DBkeys,
    setParentIDs,
  } = useTreeKeyStore();

  const { fileNameState } = useOtherStateStore();
  const { removeKeyFromFilesInfo } = useAllKeyFileStore();
  const handleClose = () => {
    setOpenDeleteKeyDialog(false);
  };

  const handleDelete = async () => {
    if (selectedTreeKey?.isNew) {
      removeKeyFromTree(selectedTreeKey.id, fileNameState);
      removeKeyFromFilesInfo(selectedTreeKey, fileNameState);
    } else {
      // if (selectedTreeKey?.children && selectedTreeKey?.children.length > 0) {
      //   // If the key has children, show a warning dialog
      //   setOpenWarningDialog(true);
      //   return;
      // }
      await deleteKeyByFullPathAndFileName(
        selectedTreeKey?.full_key_path ? selectedTreeKey.full_key_path : "",
        fileNameState
      );
      removeKeyFromTree(
        selectedTreeKey?.id ? selectedTreeKey?.id : "",
        fileNameState
      );

      if (selectedTreeKey) {
        removeKeyFromFilesInfo(selectedTreeKey, fileNameState);
      }
    }

    setOpenDeleteKeyDialog(false);
    // if (!selectedTreeKey?.id) {
    //   toast.error("Key ID is missing, cannot delete key.");
    // }
    setSelectedTreeKey(null); // Reset selected key ID after deletion

    toast.success("the key is deleted!");
  };

  // useEffect(() => {
  //   console.log(
  //     "selectedTreeKey in DeleteKeyDialog",
  //     selectedTreeKey?.children
  //   );
  // }, [selectedTreeKey]);

  return (
    <Dialog onClose={handleClose} open={open}>
      {/* <DeleteWarningDialog
        setOpenWarningDialog={setOpenWarningDialog}
        openWarningDialog={openWarningDialog}
      /> */}
      <DialogTitle textAlign={"center"}>Delete Key</DialogTitle>
      <Box
        sx={{
          padding: "10px",
        }}
      >
        {selectedTreeKey?.has_children ? (
          <Typography color='red' sx={{ padding: "10px" }} component='span'>
            Warning: delete the key {selectedTreeKey?.full_key_path} will delete
            all of its children.
          </Typography>
        ) : (
          <>
            <Typography sx={{ padding: "10px" }} component='span'>
              Are you sure to delete this key:
            </Typography>
            <Typo1624 color='red'>{selectedTreeKey?.full_key_path}</Typo1624>
          </>
        )}

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
