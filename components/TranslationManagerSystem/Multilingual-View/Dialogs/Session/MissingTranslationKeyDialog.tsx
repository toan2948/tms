import {
  Box,
  Button,
  Dialog,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

interface DialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: {
    full_key_path: string;
    color: string;
    fileName: string;
    label: string;
  }[];
}

export function MissingTranslationKeysDialog({
  open,
  setOpen,
  data,
}: DialogProps) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <Box
        sx={{
          padding: "10px",
        }}
      >
        <Typography sx={{ padding: "10px" }}>
          Below keys do not have translations for all languages, please
          translating at least one language of each key or delete the keys if
          they are unused:
        </Typography>
        <List sx={{ pt: 0 }}>
          {data.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                borderRadius: "5px",
                // cursor: "pointer",
              }}
            >
              <Typography color={item.color}> - {item.label}</Typography>
            </ListItem>
          ))}
        </List>

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
        </Stack>
      </Box>
    </Dialog>
  );
}
