import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { TranslationTreeKey } from "@/types/translation";
import { findSelectedKey } from "@/utils/languages/processData";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import * as React from "react";

type TreeViewProps = {
  data: TranslationTreeKey[];
};

export default function BasicSimpleTreeView({ data }: TreeViewProps) {
  const apiRef = useTreeViewApiRef();
  const { parentIDs } = useTreeKeyStore();
  const { selectedTreeKey, setSelectedTreeKey, DBkeys } = useTreeKeyStore();
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
    if (!selectedTreeKey?.id) return;

    // Expand all parent IDs plus the focused item
    const newExpanded = Array.from(new Set([...expandedItems, ...parentIDs]));
    setExpandedItems(newExpanded);
    // Only update if there are new items to expand
    if (
      newExpanded.length !== expandedItems.length ||
      !newExpanded.every((id) => expandedItems.includes(id))
    ) {
      setExpandedItems(newExpanded);
    }

    // Focus after a short delay to ensure the item is expanded
    const timeout = setTimeout(() => {
      const fakeSyntheticEvent = {
        currentTarget: null,
        preventDefault: () => {},
        stopPropagation: () => {},
        nativeEvent: {} as Event,
      } as unknown as React.SyntheticEvent;

      apiRef.current?.focusItem(fakeSyntheticEvent, selectedTreeKey.id);
    }, 100);

    return () => clearTimeout(timeout); // Cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTreeKey, parentIDs, fileNameState]);

  return (
    <Box sx={{ minWidth: 250, overflowY: "scroll" }}>
      <SimpleTreeView
        // onItemFocus={handleItemFocus}
        aria-label='custom tree'
        apiRef={apiRef}
        onItemClick={(event, itemId) => {
          const theKey = findSelectedKey(itemId, fileNameState, DBkeys);
          setSelectedTreeKey(theKey);
          // Toggle expanded state if this is a parent node
          // const isParent = isParentNode(data, itemId);
          // if (isParent) {
          //   setExpandedItems(
          //     (prev) =>
          //       prev.includes(itemId)
          //         ? prev.filter((id) => id !== itemId) // collapse
          //         : [...prev, itemId] // expand
          //   );
          // }
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
function isParentNode(nodes: TranslationTreeKey[], id: string): boolean {
  for (const node of nodes) {
    if (node.id === id) return !!node.children?.length;
    if (node.children?.length) {
      const found = isParentNode(node.children, id);
      if (found) return true;
    }
  }
  return false;
}
