import * as React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import { TranslationTreeKey } from "@/types/translation";

type TreeViewProps = {
  selectedKey: string | null;
  setSelectedKey: (value: string | null) => void;
  data: TranslationTreeKey[];
};

export default function BasicSimpleTreeView({
  data,
  setSelectedKey,
}: TreeViewProps) {
  const apiRef = useTreeViewApiRef();

  const renderTree = (node: TranslationTreeKey) => (
    <TreeItem
      itemId={node.id + node.full_key_path + node.level}
      label={node.key_path_segment}
      key={node.id + node.full_key_path}
    >
      {node.children?.map((child) => renderTree(child))}
    </TreeItem>
  );
  return (
    <>
      <Box sx={{ minWidth: 250, overflowY: "scroll" }}>
        <SimpleTreeView
          aria-label='custom tree'
          apiRef={apiRef}
          onItemClick={(event, itemId) => {
            const itemElement = apiRef.current?.getItemDOMElement(itemId);

            // console.log("Item clicked:", itemElement?.innerText);
            setSelectedKey(itemElement?.innerText || null);
          }}
        >
          {data.map((node) => renderTree(node))}
        </SimpleTreeView>
      </Box>
    </>
  );
}
