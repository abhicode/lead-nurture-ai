import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./component/Sidebar";
import { Box } from "@mui/material";
import { useState } from "react";
import { useAuth } from "./auth/AuthProvider";


const App: React.FC = () => {
  const auth = useAuth();
  const [selected, setSelected] = useState("Create Campaign");
  
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9fafb" }}>
      {auth.token && <Sidebar selected={selected} onSelect={setSelected} />}
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default App;

