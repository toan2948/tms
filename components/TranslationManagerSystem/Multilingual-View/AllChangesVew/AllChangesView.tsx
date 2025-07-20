import { Typo1624 } from "@/components/ui/StyledElementPaymentDetail";
import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import { useFileNameStore } from "@/store/useFileNameStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import {
  filterTranslationKeys,
  findParentIdsToRootByFullKeyPath,
  findSelectedKey,
  GroupedTranslationValues,
  groupTranslationValues,
} from "@/utils/languages/processData";
import { Box, Stack } from "@mui/material";
import React, { useMemo } from "react";
import TranslationField from "../TreeView/TranslationField";

const AllChangesView = ({
  setSeeAllChanges,
}: {
  setSeeAllChanges: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { filesInfo, DBFilesInfo } = useEditAllFileStore();

  const { setParentIDs } = useTreeKeyStore();
  const { setSelectedTreeKey, DBkeys } = useTreeKeyStore();
  const { changeFileName } = useFileNameStore();
  const changedKeys = useMemo(
    () => filterTranslationKeys(filesInfo, DBFilesInfo),
    [filesInfo]
  );

  const groupedKeys = useMemo(
    () => groupTranslationValues(changedKeys),
    [changedKeys]
  );

  // console.log("Grouped Keys:", groupedKeys);

  // useEffect(() => {
  //   console.log("changedKeys Keys:", changedKeys);
  // }, [changedKeys]);

  const handleGroupClick = (group: GroupedTranslationValues) => {
    //only need a key, no need to care about which language
    const fullKeyPath = group.list[0].fullKeyPath;
    const filename = group.filename;
    setParentIDs([]); // Reset parent IDs when changing file

    changeFileName(filename); //to build a tree corresponding to the filename

    // This is to ensure that the view updates after the state change

    const IDs = findParentIdsToRootByFullKeyPath(
      fullKeyPath,
      DBFilesInfo,
      "en",
      filename
    );
    // console.log(" IDs to root:", IDs);

    setSelectedTreeKey(findSelectedKey(IDs[0], filename, DBkeys));
    const parentIDs = Array.isArray(IDs) ? IDs.slice(1).reverse() : [];
    setParentIDs(parentIDs);
    setSeeAllChanges(false);
  };

  return (
    <Box>
      {groupedKeys && groupedKeys.length > 0 ? (
        groupedKeys.map((group, index) => (
          <Stack key={index} sx={{ margin: "30px 0" }}>
            <Typo1624
              weight={600}
              color={group.color}
              sx={{ cursor: "pointer" }}
              onClick={() => handleGroupClick(group)}
            >
              {group.filename}.{group.fullKeyPath}
            </Typo1624>
            <Box width={"95%"} alignSelf={"end"}>
              {group.list.map((item, itemIndex) => (
                <TranslationField
                  key={itemIndex}
                  index={itemIndex}
                  data={item}
                />
              ))}
            </Box>
          </Stack>
        ))
      ) : (
        <Box>No changes made.</Box>
      )}
    </Box>
  );
};

export default AllChangesView;
