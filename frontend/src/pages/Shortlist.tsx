import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress
} from "@mui/material";
import type { Lead } from "../api/Leads";
import client from "../api/client";

const ShortlistPage: React.FC = () => {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" />;
  }
  // we expect state: { leads: Lead[], projects: string[] }
  const state = location.state as { leads?: Lead[]; projects?: string[] } | undefined;
  const leads = state?.leads ?? [];
  const projectsFromState = state?.projects ?? [];

  const uniqueProjects = useMemo(() => {
    if (projectsFromState && projectsFromState.length > 0) return projectsFromState;
    return Array.from(new Set(leads.map((l) => l.project_name)));
  }, [projectsFromState, leads]);

  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignProject, setCampaignProject] = useState<string>(uniqueProjects[0] ?? "");
  const [channel, setChannel] = useState<string>("Email");
  const [offer, setOffer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const campaignRes = await client.post("/campaigns/", {
        name: campaignName,
        project_name: campaignProject,
        sales_offer_details: offer,
        nurturing_channel: channel,
        lead_ids: leads.map((l) => l.id),
      });

      const campaignId = campaignRes.data.id;

      // Call AI generation
      await client.post("/ai/auto_nurture/", {
        campaign_id: campaignId,
        lead_ids: leads.map(l => l.id),
      });

      alert("Campaign created and AI messages have been sent successfully!");

      setSuccess(true);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      );
    }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Create Campaign from Shortlisted Leads
      </Typography>

      <TextField
        fullWidth
        label="Campaign Name"
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Campaign Project Name</InputLabel>
        <Select
          label="Campaign Project Name"
          value={campaignProject}
          onChange={(e) => setCampaignProject(e.target.value)}
        >
          {uniqueProjects.map((p) => (
            <MenuItem key={p} value={p}>{p}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Nurturing Message Channel</InputLabel>
        <Select
          label="Nurturing Message Channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <MenuItem value="Email">Email</MenuItem>
          <MenuItem value="WhatsApp">WhatsApp</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder="Sales Offer Details"
        value={offer}
        onChange={(e) => setOffer(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="subtitle1">Shortlisted Leads: {leads.length}</Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
      )}
      {success && (
        <Typography color="success.main" sx={{ mb: 1 }}>
          Campaign created and emails sent!
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSubmit}
        disabled={loading || !campaignName || !campaignProject || !offer || leads.length === 0}
      >
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </Box>
  );
};

export default ShortlistPage;
