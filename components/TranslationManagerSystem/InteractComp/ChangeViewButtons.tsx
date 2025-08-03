import { useOtherStateStore } from "@/store/useOtherStateStore";
import { Box, Button } from "@mui/material";

const ChangeViewButtons = ({
  setOpenDialog,
}: {
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { seeAllChanges, setSeeAllChanges } = useOtherStateStore();

  return (
    <Box>
      <Button
        variant='contained'
        onClick={() => {
          setSeeAllChanges();
        }}
        sx={{
          marginRight: "10px",
          backgroundColor: "#4caf50",
        }}
      >
        {!seeAllChanges ? "See All Changes " : "See Tree View"}
      </Button>
      <Button onClick={() => setOpenDialog(true)} variant='contained'>
        Save Session
      </Button>
    </Box>
  );
};

export default ChangeViewButtons;
