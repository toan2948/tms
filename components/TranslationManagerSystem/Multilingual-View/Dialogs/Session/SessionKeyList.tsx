import { ColoredChangedKey } from "@/utils/languages/processData";
import { Box, List, ListItem, Typography } from "@mui/material";

type SessionKeyListProps = {
  keyStatus: string;
  formattedKeyList:
    | ColoredChangedKey[]
    | {
        full_key_path: string;
        color: string;
        fileName: string;
        label?: string;
      }[];

  handleClick: (fullKeyPath: string, filename: string) => void;
};
const SessionKeyList = ({
  formattedKeyList,
  keyStatus,
  handleClick,
}: SessionKeyListProps) => {
  return (
    <>
      <Typography>{keyStatus}:</Typography>

      <Box
        sx={{
          border: "1px solid black",

          padding: "10px",
          marginBottom: "10px",
        }}
      >
        <List sx={{ pt: 0 }}>
          {formattedKeyList.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                handleClick(item.full_key_path, item.fileName);
              }}
            >
              {item.label ? (
                <Typography color={item.color}> {item.label}</Typography>
              ) : (
                <Typography color={item.color}>
                  {" "}
                  {item.full_key_path}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );
};

export default SessionKeyList;
