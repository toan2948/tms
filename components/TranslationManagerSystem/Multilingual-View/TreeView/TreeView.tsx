import { Typo1424 } from "@/components/ui/StyledElementPaymentDetail";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { TranslationTreeKey } from "@/types/translation";
import { Stack } from "@mui/material";
import { HeaderBox } from "../MultilingualView";
import BasicSimpleTreeView from "./BasicSimpleTreeView";
import TranslationValueList from "./TranslationValueList";

const TreeView = ({ treeKeys }: { treeKeys: TranslationTreeKey[] }) => {
  const { selectedTreeKey } = useTreeKeyStore();

  return (
    <>
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
          {selectedTreeKey?.has_children === false && <TranslationValueList />}
        </Stack>
      </Stack>
    </>
  );
};

export default TreeView;
