import * as React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import { TranslationTreeKey } from "@/types/translation";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
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
  const { focusedKey, parentIDs } = useTreeKeyStore();
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
      // apiRef.current?.focusItem(
      //   fakeSyntheticEvent,
      //   "4f89fb90-b5ff-4179-b587-faf2f94dd7c3"
      // );

      // apiRef.current?.focusItem(
      //   fakeSyntheticEvent,
      //   "b33a359b-2dcd-40fc-a6ce-ce5533bd6fcd"
      // );

      apiRef.current?.focusItem(fakeSyntheticEvent, focusedKey.id || "");
    }, 100);
  };
  const expandToItem = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    targetId: string
  ) => {
    const ancestors = parentIDs;

    //common.login.button
    // const ancestors = [
    //   "c6e71efe-c016-461a-a1b7-8d899e6b0353",
    //   "4d528fa7-78b8-429a-8ebc-4ed55063dd7b",
    // ];

    const newExpanded = Array.from(
      new Set([...expandedItems, ...ancestors, targetId])
    );
    setExpandedItems(newExpanded);
    setSelectedKey(focusedKey.id || null);

    // Optionally, focus the item:

    // apiRef.current?.focusItem(event, targetId);
    // handleItemFocus();
  };

  return (
    <Box sx={{ minWidth: 250, overflowY: "scroll" }}>
      <Button
        onClick={(event) => {
          console.log("Focused Key:", focusedKey, "Parent IDs:", parentIDs);

          // expandToItem(event, "b33a359b-2dcd-40fc-a6ce-ce5533bd6fcd");
          expandToItem(event, focusedKey.id || "");
          handleItemFocus(); // Delay to ensure the item is expanded before focusing
        }}
      >
        Expand/focus Item
      </Button>

      <SimpleTreeView
        // onItemFocus={handleItemFocus}
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
