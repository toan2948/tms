import { useAllKeyFileStore } from "@/store/useAllKeyFileStore";
import { useOtherStateStore } from "@/store/useOtherStateStore";
import { useTreeKeyStore } from "@/store/useTreeKeyStore";
import { GroupedKeys } from "@/types/keyType";
import {
  findParentIdsToRootByFullKeyPath,
  findSelectedKey,
  groupingKeys,
  processedChangedKeys,
} from "@/utils/languages/processData";
import { Box, Divider } from "@mui/material";
import { useMemo } from "react";
import { KeySection } from "./KeySection";

const AllChangesView = () => {
  const { filesInfo } = useAllKeyFileStore();

  const { setSelectedTreeKey, setParentIDs, setFileName } = useTreeKeyStore();
  const { setSeeAllChanges } = useOtherStateStore();

  const {
    editedKeys,
    NotEmptyNewKeys,
    missingTranslationKeys,
    newLowestLevelKeys,
  } = useMemo(() => processedChangedKeys(filesInfo), [filesInfo]);

  //formatting data for displaying
  const groupedEditedValueKeys = useMemo(
    () =>
      groupingKeys(
        editedKeys,
        (e) => (!e.isNew && e.old_segment !== e.key_path_segment) || e.isChanged //if the key name is changed, only the key whose segment is changed will be grouped
      ),
    [editedKeys]
  );

  const groupedNewKeys = useMemo(
    () => groupingKeys(NotEmptyNewKeys, (e) => e.isNew === true),
    [NotEmptyNewKeys]
  );

  const groupedEmptyKeys = useMemo(() => {
    return groupingKeys(missingTranslationKeys.flatMap((group) => group.keys));
  }, [missingTranslationKeys]);

  const handleGroupClick = (group: GroupedKeys) => {
    //only need a key, no need to care about which language
    const fullKeyPath = group.list[0].full_key_path;
    const filename = group.fileName;

    setFileName(filename); //to build a tree corresponding to the filename

    // This is to ensure that the view updates after the state change

    const IDs = findParentIdsToRootByFullKeyPath(
      fullKeyPath,
      filesInfo,
      filename
    );

    setSelectedTreeKey(findSelectedKey(IDs[0], filename, filesInfo));
    setParentIDs(Array.isArray(IDs) ? IDs.slice(1).reverse() : []);
    setSeeAllChanges(false);
  };

  return (
    <Box>
      {groupedEmptyKeys && groupedEmptyKeys.length > 0 && (
        <KeySection
          formattedKeyList={groupedEmptyKeys}
          keyStatus='Missing Translation Values'
          handleGroupClick={handleGroupClick}
        />
      )}
      {groupedEditedValueKeys && groupedEditedValueKeys.length > 0 && (
        <KeySection
          formattedKeyList={groupedEditedValueKeys}
          keyStatus='Edited Keys'
          handleGroupClick={handleGroupClick}
        />
      )}
      <Divider sx={{ margin: "20px 0" }} />

      {groupedNewKeys && groupedNewKeys.length > 0 && (
        <KeySection
          formattedKeyList={groupedNewKeys}
          keyStatus='New Keys'
          handleGroupClick={handleGroupClick}
        />
      )}

      {!groupedEditedValueKeys && !newLowestLevelKeys && (
        <Box>No changes made.</Box>
      )}
    </Box>
  );
};

export default AllChangesView;
