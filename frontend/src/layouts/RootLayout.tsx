import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";

const RootLayout: React.FC = () => {
  return (
    <Box>
      <TopBar />
      <Outlet />
    </Box>
  );
};

const TopBar: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6">Proplens</Typography>
        <Box>
          {auth.token ? (
            <Button onClick={() => { auth.logout(); navigate('/login'); }}>Logout</Button>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/register')}>Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default RootLayout;
