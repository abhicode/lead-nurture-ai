import React, { useState } from "react";
import { Box, Button, TextField, Typography, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data || "Login failed");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Login
          </Typography>
          <form onSubmit={submit}>
            <TextField label="Username" fullWidth sx={{ mb: 2 }} value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField label="Password" fullWidth type="password" sx={{ mb: 2 }} value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <Typography color="error" sx={{ mb: 2 }}>{String(error)}</Typography>}
            <Button type="submit" variant="contained">Login</Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
