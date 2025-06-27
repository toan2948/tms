import * as React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import { createClient } from "@/utils/supabase/server";
import { NestedObject } from "@/store/store";
import { buildTree, TreeNode } from "@/utils/languages/dataFunctions";

type TreeViewProps = {
  selectedKey: string | null;
  setSelectedKey: (value: string | null) => void;
  data: NestedObject[];
};

export async function TreeData() {
  const supabase = await createClient();
  const { data } = await supabase.from("EN_kv").select("*");

  return JSON.stringify(data ?? {}, null, 2);
}

export default function BasicSimpleTreeView({
  data,
  setSelectedKey,
}: TreeViewProps) {
  const apiRef = useTreeViewApiRef();
  const treeData = buildTree(data);
  console.log("TreeData:", treeData);

  const renderTree = (nodes: TreeNode) => (
    <TreeItem
      itemId={nodes.key + nodes.title}
      label={nodes.title}
      key={nodes.key}
    >
      {nodes.children?.map((child) => renderTree(child))}
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
          {treeData.map((node) => renderTree(node))}
        </SimpleTreeView>
      </Box>
    </>
  );
}
