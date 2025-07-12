import * as React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import { TranslationTreeKey } from "@/types/translation";
import { Button } from "@mui/material";

type TreeViewProps = {
  selectedKey: string | null;
  setSelectedKey: (value: string | null) => void;
  data: TranslationTreeKey[];
};

export default function BasicSimpleTreeView({
  data,
  setSelectedKey,
}: TreeViewProps) {
  // const [selectedItem, setSelectedItem] = React.useState<string>("");
  const apiRef = useTreeViewApiRef();
  const renderTree = (node: TranslationTreeKey) => (
    <TreeItem
      // itemId={`${node.id}|${node.full_key_path}|${node.level}`}
      itemId={node.id}
      label={node.key_path_segment}
      key={node.id + node.full_key_path}
    >
      {node.children?.map((child) => renderTree(child))}
    </TreeItem>
  );
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const handleExpandItem = (id: string) => {
    setExpanded((prev) => [...new Set([...prev, id])]);
  };
  // console.log("expanded", expanded);

  // React.useEffect(() => {
  //   console.log(
  //     "apiRef",
  //     apiRef.current?.getItem(selectedItem),

  // }, [selectedItem]);

  return (
    <Box sx={{ minWidth: 250, overflowY: "scroll" }}>
      <Button
        onClick={() => handleExpandItem("8eb713c7-7e7e-45e9-b04c-adbbdc25b8fe")}
      >
        Expand Item
      </Button>
      <SimpleTreeView
        aria-label='custom tree'
        apiRef={apiRef}
        onItemClick={(event, itemId) => {
          setSelectedKey(itemId);
          console.log("Selected :", itemId);
        }}
        expandedItems={expanded}
        onExpandedItemsChange={(event, ids) => setExpanded(ids)}
      >
        {data.map((node) => renderTree(node))}
      </SimpleTreeView>
    </Box>
  );
}
