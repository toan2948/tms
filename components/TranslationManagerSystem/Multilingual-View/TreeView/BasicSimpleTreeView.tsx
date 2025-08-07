import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { TranslationTreeKey } from "@/types/keyType";
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
  const { parentIDs, setParentIDs, selectedTreeKey, setSelectedTreeKey } =
    useTreeKeyStore();
  const { filesInfo } = useAllKeyFileStore();
  const { fileNameState } = useOtherStateStore();
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
    if (!selectedTreeKey?.id) {
      setExpandedItems([]); //remove all expanding items when open another file
      return;
    }

    // Expand all parent IDs plus the focused item
    const newExpanded = Array.from(new Set([...expandedItems, ...parentIDs]));
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
  }, [selectedTreeKey, fileNameState]);

  return (
    <Box sx={{ minWidth: 250, overflowY: "scroll" }}>
      <SimpleTreeView
        // onItemFocus={handleItemFocus}
        aria-label='custom tree'
        apiRef={apiRef}
        onItemClick={(event, itemId) => {
          setParentIDs([]); //no longer needed, only need when redirect from AllChangeView or SessionDialog

          const theKey = findSelectedKey(itemId, fileNameState, filesInfo);
          setSelectedTreeKey(theKey);
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
