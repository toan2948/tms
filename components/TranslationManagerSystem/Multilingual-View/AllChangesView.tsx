import { useEditAllFileStore } from "@/store/useEditAllFileStore";
import {
  filterTranslationKeys,
  groupTranslationValues,
} from "@/utils/languages/processData";
import { Box, Stack } from "@mui/material";
import React, { useMemo } from "react";
import TranslationField from "./TreeView/TranslationField";
import { Typo1624 } from "@/components/ui/StyledElementPaymentDetail";

const AllChangesView = () => {
  const { filesInfo } = useEditAllFileStore();
  const changedKeys = useMemo(
    () => filterTranslationKeys(filesInfo),
    [filesInfo]
  );
  //   const sessionData = formatSessionDialogData(changedKeys);
  // console.log("Session Data:", sessionData);
  //
  //   console.log("Changed Keys:", changedKeys);

  const groupedKeys = useMemo(
    () => groupTranslationValues(changedKeys),
    [changedKeys]
  );
  //   console.log("Grouped Keys:", groupedKeys);

  return (
    <Box>
      {groupedKeys && groupedKeys.length > 0 ? (
        groupedKeys.map((group, index) => (
          <Stack key={index} sx={{ margin: "10px 0" }}>
            <Typo1624 weight={600} color='blue'>
              {group.filename}.{group.fullKeyPath}
            </Typo1624>
            <Box width={"80%"} alignSelf={"end"}>
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
