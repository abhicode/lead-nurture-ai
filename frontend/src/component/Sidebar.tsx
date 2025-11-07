import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import BarChartIcon from "@mui/icons-material/BarChart";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  selected: string;
  onSelect: (label: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selected, onSelect }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: "Create Campaign", icon: <CampaignIcon />, path: "/" },
    { label: "Campaign Analytics", icon: <BarChartIcon />, path: "/analytics" },
    { label: "AI Follow Up", icon: <ChatBubbleIcon />, path: "/followup" },
  ];

  const handleClick = (label: string, path: string) => {
    onSelect(label);
    navigate(path);
  };

  return (
    <Box
      sx={{
        width: 250,
        bgcolor: "white",
        borderRight: "1px solid #ddd",
        p: 2,
        height: "100vh",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        Navigation
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            onClick={() => handleClick(item.label, item.path)}
            selected={selected === item.label}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
