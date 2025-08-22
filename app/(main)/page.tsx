"use client"
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TranslationSection from '@/components/TranslationManagerSystem';
import { Button, Stack } from '@mui/material';
import { Typo1624 } from '@/components/ui/StyledElementPaymentDetail';
import { signOut } from '../login/actions';
import { getProfile } from '@/utils/languages/login';
import { useUserStore } from '@/store/useUserStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && (
        <Box sx={{ p: 3, width: "100%" }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs() {
  const [value, setValue] = React.useState(0);
  const { setUser, user } = useUserStore();

  const handleSignout = async () => {
    await signOut();
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getProfile();
      setUser(profile);
    };
    fetchProfile();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>

      <Stack direction={"row"} justifyContent={"space-between"}>
        <Box>
          <Typo1624>User: {user?.full_name || user?.email}</Typo1624>
        </Box>

        <Button onClick={() => handleSignout()}>Sign out</Button>
      </Stack>

      <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
      >
        <Stack sx={{ borderRight: 1, borderColor: 'divider', height: "100%" }}>


          <Box textAlign={"center"} padding={6} >FE Boards</Box>
          <Tabs

            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab label="TMS" {...a11yProps(0)} />
            <Tab label="Project Two" {...a11yProps(1)} />
            <Tab label="Project Three" {...a11yProps(2)} />

          </Tabs>
        </Stack>
        <TabPanel value={value} index={0}>
          <TranslationSection />
        </TabPanel>
        <TabPanel value={value} index={1}>
          Project Two
        </TabPanel>
        <TabPanel value={value} index={2}>
          Project Three
        </TabPanel>

      </Box>
    </>
  );
}