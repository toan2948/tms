import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { TranslationTreeKey } from "@/types/translation";
import { Box, Button, Stack } from "@mui/material";
import { useState } from "react";
import { DeleteKeyDialog } from "../Dialogs/DeleteKeyDialog";
import { HeaderBox } from "../MultilingualView";
import BasicSimpleTreeView from "./BasicSimpleTreeView";
import TranslationValueList from "./TranslationValueList";

const TreeView = ({ treeKeys }: { treeKeys: TranslationTreeKey[] }) => {
  const { selectedTreeKey } = useTreeKeyStore();
  const [openDeleteKeyDialog, setOpenDeleteKeyDialog] = useState(false);

  return (
    <>
      <DeleteKeyDialog
        open={openDeleteKeyDialog}
        setOpenDeleteKeyDialog={setOpenDeleteKeyDialog}
      />
      <Stack
        direction={"row"}
        border={"solid 1px black"}
        justifyContent={"space-around"}
        maxHeight='500px'
      >
        <Stack width={"50%"} borderRight={"solid 1px black"}>
          <HeaderBox>
            <Typo1424 textAlign={"center"}>Keys</Typo1424>
          </HeaderBox>
          <BasicSimpleTreeView data={treeKeys} />
        </Stack>
        <Stack width={"100%"} direction={"column"}>
          <HeaderBox>
            <Typo1424 textAlign={"center"}>Language</Typo1424>
          </HeaderBox>
          {selectedTreeKey?.has_children === false && (
            <>
              <Stack
                width={"100%"}
                direction={"row"}
                alignItems={"center"}
                justifyContent={"space-between"}
                sx={{
                  padding: "10px 10px 0 10px",
                }}
              >
                <Box>
                  <Typo1424 weight={600}>
                    Key to translate: {selectedTreeKey?.key_path_segment}
                  </Typo1424>
                  <Typo1424 weight={500}>
                    {selectedTreeKey?.notes || "No notes available"}
                  </Typo1424>
                </Box>

                <Box>
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
                    onClick={() => setOpenDeleteKeyDialog(true)}
                  >
                    Delete
                  </Button>
                  <Button variant={"outlined"}>Edit</Button>
                </Box>
              </Stack>
              <TranslationValueList />
            </>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export default TreeView;
