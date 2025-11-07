import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "../theme/component/Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [selectedNav, setSelectedNav] = useState("Create Campaign");

  return (
    <Box display="flex" height="100vh">
      <Sidebar selected={selectedNav} onSelect={setSelectedNav} />
      <Box flex={1} p={4} bgcolor="#fafafa" overflow="auto">
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
