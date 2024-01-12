import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import TokenIcon from "@mui/icons-material/MonetizationOn";
import Link from 'next/link';
import { useRouter } from 'next/router';
import mintSBTWhitelist from '../src/js/whitelist';

const drawerWidth = 240;

function LeftBar() {
  const router = useRouter();

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: '/mypage' },
    { text: "Issue Certs", icon: <HistoryEduIcon />, path: '/mintSBT' },
    { text: "Verify Certs", icon: <PersonSearchIcon />, path: '/verifyVC' },
    { text: "Manage Certs", icon: <TokenIcon />, path: 'manageCerts' },
  ];
  const settingItems = [
    { text: "Help Center", icon: <HelpCenterIcon /> },
    { text: "Settings", icon: <SettingsIcon /> },
  ];

  const handleListMenuItemClick = async (text: string) => {
    switch (text) {
      case "Home":
        router.push("/mypage");
        break;
      case "Verify Certs":
        router.push("/verifyVC");
        break;
      case "Issue Certs":
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          const account = accounts[0];
          console.log(account);

          // Check if the user's account is in the whitelist
          if (!mintSBTWhitelist.includes(BigInt(account))) {
            // User is not allowed, show error and don't proceed with navigation
            confirm('Access to this page is restricted for this account.');
            return;
          }

          // User is allowed, proceed with navigation
          router.push("/mintSBT");
        } catch (error) {
          // Handle error from window.ethereum.request
          console.error("Error fetching accounts:", error);
        }
        break;
      case "Manage Certs":
        router.push("/manageCerts");
        break;
      default:
        break;
    }
  };

  const handleListSettingItemClick = (text: string) => {
    switch (text) {
      case "Help Center":
        //router.push("/mypage/helpcenter");
        break;
      case "Settings":
        //router.push("/mypage/settings");
        break;
      default:
        break;
    }
  };

  return (
    <Box>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          {/* {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Link href={`${item.path}`} passHref>
                <ListItemButton component="a">
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))} */}
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              {/* <Link href={`${item.path}`} passHref> */}
              <ListItemButton component="a" onClick={() => handleListMenuItemClick(item.text)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
              {/* </Link> */}
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {settingItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleListSettingItemClick(item.text)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}

export default LeftBar;
