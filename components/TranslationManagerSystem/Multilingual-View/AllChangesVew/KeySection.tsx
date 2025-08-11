import { Typo1624 } from "@/components/ui/StyledElementPaymentDetail";
import { GroupedTranslationValues } from "@/utils/languages/processData";
import { Box, Stack } from "@mui/material";
import TranslationField from "../TreeView/FieldList/TranslationField";

type KeySectionProps = {
  keyStatus: string;
  formattedKeyList: GroupedTranslationValues[];

  handleGroupClick: (group: GroupedTranslationValues) => void;
};
export const KeySection = ({
  formattedKeyList,
  keyStatus,
  handleGroupClick,
}: KeySectionProps) => {
  return (
    <>
      <Typo1624 weight={600} color='orange'>
        {keyStatus}:
      </Typo1624>

      {formattedKeyList.map((group, index) => (
        <Stack key={index} sx={{ margin: "30px 0" }}>
          <Typo1624
            weight={600}
            color={group.color}
            sx={{ cursor: "pointer" }}
            onClick={() => handleGroupClick(group)}
          >
            {group.filename}: {group.fullKey}
          </Typo1624>
          {group.isKeyNameChanged &&
            group.pathSegment !== group.old_pathSegment && (
              <Typo1624 color='red'>
                (Old key name: {group.oldFullKey ? group.oldFullKey : "Null"})
              </Typo1624>
            )}

          <Box width={"95%"} alignSelf={"end"}>
            {group.list.map(
              (item, itemIndex) =>
                !item.has_children &&
                item.isChanged && (
                  <TranslationField
                    key={itemIndex}
                    index={itemIndex}
                    data={item}
                  />
                )
            )}
          </Box>
        </Stack>
      ))}
    </>
  );
};
