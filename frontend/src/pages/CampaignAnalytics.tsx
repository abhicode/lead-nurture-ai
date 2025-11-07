import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventIcon from "@mui/icons-material/Event";
import client from "../api/client";

interface Campaign {
  id: number;
  name: string;
  project_name: string;
  leads_count: number;
  messages_sent: number;
  created_at: string;
}

const CampaignAnalytics: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await client.get("/campaigns/metrics");
        setCampaigns(res.data);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    const campaign = campaigns.find((c) => c.id === id) || null;
    setSelectedCampaign(campaign);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <BarChartIcon fontSize="large" color="primary" />
        Campaign Analytics
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Campaign</InputLabel>
        <Select
          value={selectedId}
          onChange={(e) => handleSelect(Number(e.target.value))}
          label="Select Campaign"
        >
          {campaigns.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCampaign ? (
        <Card sx={{ p: 3, backgroundColor: "#fafafa" }} elevation={3}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {selectedCampaign.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Project: {selectedCampaign.project_name}
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3}}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: "center",
                    backgroundColor: "#e3f2fd",
                    borderRadius: 2,
                  }}
                  elevation={0}
                >
                  <PeopleAltIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Leads Shortlisted</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedCampaign.leads_count}
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3}}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: "center",
                    backgroundColor: "#f3e5f5",
                    borderRadius: 2,
                  }}
                  elevation={0}
                >
                  <MailOutlineIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Messages Sent</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedCampaign.messages_sent}
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3}}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: "center",
                    backgroundColor: "#e8f5e9",
                    borderRadius: 2,
                  }}
                  elevation={0}
                >
                  <EventIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Created On</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(selectedCampaign.created_at).toLocaleDateString()}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Typography color="text.secondary" variant="body1">
          Select a campaign to view analytics.
        </Typography>
      )}
    </Box>
  );
};

export default CampaignAnalytics;
