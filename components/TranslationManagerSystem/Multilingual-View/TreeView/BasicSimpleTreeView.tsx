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
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const handleItemFocus = () => {
    setTimeout(() => {
      const fakeSyntheticEvent = {
        currentTarget: null,
        preventDefault: () => {},
        stopPropagation: () => {},
        nativeEvent: {} as Event,
      } as unknown as React.SyntheticEvent;
      apiRef.current?.focusItem(
        fakeSyntheticEvent,
        "4f89fb90-b5ff-4179-b587-faf2f94dd7c3"
      );
    }, 100);
  };
  const expandToItem = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    targetId: string
  ) => {
    const ancestors = [
      "8eb713c7-7e7e-45e9-b04c-adbbdc25b8fe",
      "88168632-a715-4df0-ad22-0521f969f48d",
    ];
    const newExpanded = Array.from(
      new Set([...expandedItems, ...ancestors, targetId])
    );
    setExpandedItems(newExpanded);

    // Optionally, focus the item:

    // apiRef.current?.focusItem(event, targetId);
    // handleItemFocus();
  };

  return (
    <Box sx={{ minWidth: 250, overflowY: "scroll" }}>
      <Button
        onClick={(event) => {
          expandToItem(event, "4f89fb90-b5ff-4179-b587-faf2f94dd7c3");
          handleItemFocus(); // Delay to ensure the item is expanded before focusing
        }}
      >
        Expand/focus Item
      </Button>

      <SimpleTreeView
        onItemFocus={handleItemFocus}
        aria-label='custom tree'
        apiRef={apiRef}
        onItemClick={(event, itemId) => {
          setSelectedKey(itemId);
          console.log("Selected :", itemId);
        }}
        expandedItems={expandedItems}
        onExpandedItemsChange={(event, newExpandedItems) => {
          setExpandedItems(newExpandedItems);
        }}
      >
        {data.map((node) => renderTree(node))}
      </SimpleTreeView>
    </Box>
  );
}
