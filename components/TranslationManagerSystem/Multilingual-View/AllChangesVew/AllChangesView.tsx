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
import { Box, Divider, Stack } from "@mui/material";
import React, { useMemo } from "react";
import TranslationField from "../TreeView/TranslationField";

const AllChangesView = ({
  setSeeAllChanges,
}: {
  setSeeAllChanges: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { filesInfo } = useEditAllFileStore();

  const { setParentIDs } = useTreeKeyStore();
  const { setSelectedTreeKey, DBkeys } = useTreeKeyStore();
  const { setFileName } = useFileNameStore();
  const changedKeys = useMemo(
    () => filterTranslationKeys(filesInfo),
    [filesInfo]
  );
  const newKeys = useMemo(
    () =>
      changedKeys.filter(
        (key) => key.isNew && key.language_code === "en" && !key.has_children //reduce the key to english language only and has no children
      ),
    [changedKeys]
  );

  // console.log("changedKeys", changedKeys);

  const groupedChangedKeys = useMemo(
    () => groupTranslationValues(changedKeys, (e) => !e.isNew),
    [changedKeys]
  );
  const groupedNewKeys = useMemo(
    () => groupTranslationValues(newKeys, (e) => (e.isNew ? true : false)),
    [newKeys]
  );

  // console.log("groupedNewKeys", newKeys, groupedNewKeys);

  const handleGroupClick = (group: GroupedTranslationValues) => {
    //only need a key, no need to care about which language
    const fullKeyPath = group.list[0].full_key_path;
    const filename = group.filename;

    setFileName(filename); //to build a tree corresponding to the filename

    // This is to ensure that the view updates after the state change

    const IDs = findParentIdsToRootByFullKeyPath(
      fullKeyPath,
      filesInfo,
      "en",
      filename
    );
    // console.log(" IDs to root:", IDs);

    setSelectedTreeKey(findSelectedKey(IDs[0], filename, DBkeys));
    setParentIDs(Array.isArray(IDs) ? IDs.slice(1).reverse() : []);
    setSeeAllChanges(false);
  };

  return (
    <Box>
      {groupedChangedKeys && groupedChangedKeys.length > 0 && (
        <>
          <Typo1624 weight={600} color='green'>
            Edited Keys:
          </Typo1624>

          {groupedChangedKeys.map((group, index) => (
            <Stack key={index} sx={{ margin: "30px 0" }}>
              <Typo1624
                weight={600}
                color={group.color}
                sx={{ cursor: "pointer" }}
                onClick={() => handleGroupClick(group)}
              >
                {group.filename}: {group.fullKey}
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
          ))}
        </>
      )}
      <Divider sx={{ margin: "20px 0" }} />

      {groupedNewKeys && groupedNewKeys.length > 0 && (
        <>
          <Typo1624 weight={600} color='orange'>
            New Keys:
          </Typo1624>

          {groupedNewKeys.map((group, index) => (
            <Stack key={index} sx={{ margin: "30px 0" }}>
              <Typo1624
                weight={600}
                color={group.color}
                sx={{ cursor: "pointer" }}
                onClick={() => handleGroupClick(group)}
              >
                {group.filename}: {group.fullKey}
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
          ))}
        </>
      )}

      {!groupedChangedKeys && !newKeys && <Box>No changes made.</Box>}
    </Box>
  );
};

export default AllChangesView;
