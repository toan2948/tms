import { Typo1624 } from "@/components/ui/StyledElementPaymentDetail";
import { GroupedKeys } from "@/types/keyType";
import { Box, Stack } from "@mui/material";
import TranslationField from "../TreeView/FieldList/TranslationField";

type KeySectionProps = {
  keyStatus: string;
  formattedKeyList: GroupedKeys[];

  handleGroupClick: (group: GroupedKeys) => void;
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
            {group.fileName}: {group.full_key_path}
          </Typo1624>
          {group.isNameEdited &&
            group.key_path_segment !== group.old_segment && (
              <Typo1624 color='red'>
                (Old key name:{" "}
                {group.old_full_key_path ? group.old_full_key_path : "Null"})
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
