import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { Button, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { HeaderBox } from "../MultilingualView";
import BasicSimpleTreeView from "./BasicSimpleTreeView";
import TranslationValueList from "./TranslationValueList";
import { TranslationTreeKey } from "@/types/translation";
import { useFileNameStore, useKeyStore } from "@/store/useFileNameStore";
import { DeleteKeyDialog } from "../Dialogs/DeleteKeyDialog";

const TreeView = ({ treeKeys }: { treeKeys: TranslationTreeKey[] }) => {
  const { DBkeys, updateFullKeyPathState } = useKeyStore();
  const [selectedKeyID, setSelectedKeyID] = useState<string>("");
  const [path_segment, setPathSegment] = useState<string>("");
  const { fileNameState } = useFileNameStore();
  const [openDeleteKeyDialog, setOpenDeleteKeyDialog] = useState(false);

  useEffect(() => {
    const keysInFile = DBkeys.find((e) => e.fileName === fileNameState)?.keys;
    if (!keysInFile) {
      console.warn("No keys found for the current file:", fileNameState);

      return;
    }
    const key = keysInFile.find((k) => k.id === selectedKeyID);
    if (key) {
      updateFullKeyPathState(key.full_key_path);
      setPathSegment(key.key_path_segment);
    } else {
      setSelectedKeyID("");
      setPathSegment("");
    }
  }, [selectedKeyID, fileNameState]);
  return (
    <>
      <DeleteKeyDialog
        open={openDeleteKeyDialog}
        setOpenDeleteKeyDialog={setOpenDeleteKeyDialog}
        selectedKey={selectedKeyID}
        setSelectedKeyID={setSelectedKeyID} //update path_segment when key is deleted
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
          <BasicSimpleTreeView
            selectedKey={selectedKeyID}
            setSelectedKey={setSelectedKeyID}
            data={treeKeys}
          />
        </Stack>
        <Stack width={"100%"} direction={"column"}>
          <HeaderBox>
            <Typo1424 textAlign={"center"}>Language</Typo1424>
          </HeaderBox>
          {selectedKeyID && (
            <>
              <Stack
                width={"100%"}
                direction={"row"}
                alignItems={"center"}
                sx={{
                  marginTop: "10px",
                }}
              >
                <Typo1424 weight={600}>
                  Key to translate: {path_segment}
                </Typo1424>
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
              </Stack>
              <TranslationValueList path_segment={path_segment} />
            </>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export default TreeView;
