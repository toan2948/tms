import * as React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import { TranslationTreeKey } from "@/types/translation";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { useFileNameStore } from "@/store/useFileNameStore";

type TreeViewProps = {
  selectedKey: string | null;
  setSelectedKey: (value: string | null) => void;
  data: TranslationTreeKey[];
};

export default function BasicSimpleTreeView({
  data,
  setSelectedKey,
  selectedKey,
}: TreeViewProps) {
  // const [selectedItem, setSelectedItem] = React.useState<string>("");
  const apiRef = useTreeViewApiRef();
  const { focusedKey, parentIDs } = useTreeKeyStore();
  const { fileNameState } = useFileNameStore();
  const renderTree = (node: TranslationTreeKey) => (
    <TreeItem
      itemId={node.id}
      label={node.key_path_segment}
      key={node.id + node.full_key_path}
    >
      {node.children?.map((child) => renderTree(child))}
    </TreeItem>
  );
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!focusedKey?.id) return;

    // Expand all parent IDs plus the focused item
    const newExpanded = Array.from(
      new Set([...expandedItems, ...parentIDs, focusedKey.id])
    );
    setExpandedItems(newExpanded);
    setSelectedKey(focusedKey.id);

    // Focus after a short delay to ensure the item is expanded
    const timeout = setTimeout(() => {
      const fakeSyntheticEvent = {
        currentTarget: null,
        preventDefault: () => {},
        stopPropagation: () => {},
        nativeEvent: {} as Event,
      } as unknown as React.SyntheticEvent;

      apiRef.current?.focusItem(fakeSyntheticEvent, focusedKey.id);
    }, 100);

    return () => clearTimeout(timeout); // Cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedKey.id, parentIDs, fileNameState]);
  React.useEffect(() => {
    setSelectedKey(focusedKey.id);
  }, [expandedItems, focusedKey.id, setSelectedKey]);

  console.log("selectedKey", selectedKey);

  return (
    <Box sx={{ minWidth: 250, overflowY: "scroll" }}>
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
