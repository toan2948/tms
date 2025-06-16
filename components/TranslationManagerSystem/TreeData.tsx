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
      {/* <div>
        <Button onClick={handleScrollToChartsCommunity}>
          Focus and scroll to charts community item
        </Button>
      </div> */}
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
        {/* <SimpleTreeView
          apiRef={apiRef}
          onItemClick={(event, itemId) => {
            const itemElement = apiRef.current?.getItemDOMElement(itemId);

            // console.log("Item clicked:", itemElement?.innerText);
            setSelectedKey(itemElement?.innerText || null);
          }}
        >
          {treeData.map((item) => (
            <TreeItem
              key={item.key}
              itemId={item.key + item.title}
              label={item.title}
            >
              {item.children && item.children.length > 0
                ? item.children.map((child) => (
                    <TreeItem
                      key={child.key}
                      itemId={child.key + child.title}
                      label={child.title}
                    >
                      {child.children && child.children.length > 0
                        ? child.children.map((grandChild) => (
                            <TreeItem
                              key={grandChild.key}
                              itemId={grandChild.key + grandChild.title}
                              label={grandChild.title}
                            />
                          ))
                        : null}
                    </TreeItem>
                  ))
                : null}
            </TreeItem>
          ))} */}
        {/* <TreeItem itemId='grid' label='Home'>
            <TreeItem itemId='grid-community' label='Title' />
            <TreeItem itemId='grid-pro' label='Account' />
            <TreeItem itemId='grid-premium' label='Account2'>
              <TreeItem itemId='grid-community2' label='Name' />
              <TreeItem itemId='grid-pro2' label='Addresse'>
                <TreeItem itemId='grid-community3' label='City' />
              </TreeItem>
            </TreeItem>
          </TreeItem>
          <TreeItem itemId='pickers' label='Date and Time Pickers'>
            <TreeItem itemId='pickers-community' label='@mui/x-date-pickers' />
            <TreeItem itemId='pickers-pro' label='@mui/x-date-pickers-pro'>
              <TreeItem itemId='charts-community2' label='@mui/x-charts' />
              <TreeItem itemId='charts-pro2' label='@mui/x-charts-pro'>
                <TreeItem itemId='charts-community3' label='@mui/x-charts' />
                <TreeItem itemId='charts-pro3' label='@mui/x-charts-pro' />
              </TreeItem>
            </TreeItem>
          </TreeItem>
          <TreeItem itemId='charts' label='Charts'>
            <TreeItem itemId='charts-community' label='@mui/x-charts' />
            <TreeItem itemId='charts-pro' label='@mui/x-charts-pro' />
          </TreeItem>
          <TreeItem itemId='tree-view' label='Tree View'>
            <TreeItem itemId='tree-view-community' label='@mui/x-tree-view' />
            <TreeItem itemId='tree-view-pro' label='@mui/x-tree-view-pro' />
          </TreeItem> */}
        {/* </SimpleTreeView> */}
      </Box>
    </>
  );
}

// const renderTree = (data: UnknownObject[], level = 0): JSX.Element[] => {
//   return data.map((item, index) => {
//     const hasChildren =
//       Array.isArray(item.children) && item.children.length > 0;
//     return (
//       <div
//         key={`${level}-${index}`}
//         style={{ marginLeft: `${level * 40}px` }}
//       >
//         <Stack direction={"row"}>
//           {hasChildren && <AddCircleOutlineIcon />}
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <span style={{ fontWeight: hasChildren ? "bold" : "normal" }}>
//               {String(item.name)}
//             </span>
//           </div>
//         </Stack>

//         {hasChildren &&
//           renderTree(item.children as UnknownObject[], level + 1)}
//       </div>
//     );
//   });
// };

// const TreeView = () => {
//   return <div>{renderTree(arr1)}</div>;
// };
