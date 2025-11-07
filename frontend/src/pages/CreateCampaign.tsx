import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormGroup,
  FormControl,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
  Stack,
  Button
} from "@mui/material";
import { getLeads } from "../api/Leads";
import type { Lead } from "../api/Leads";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const LEAD_STATUS_OPTIONS = [
  "Not Connected",
  "Connected",
  "Visit scheduled",
  "Visit done not purchased",
  "Purchased",
  "Not interested",
];

const CampaignPage: React.FC = () => {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" />;
  }


  // filter states
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const [unitTypes, setUnitTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await getLeads();
        setLeads(res);
      } catch (err) {
        console.error("Failed to fetch leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const uniqueProjects = Array.from(new Set(leads.map((l) => l.project_name)));

  const handleStatusChange = (status: string) => {
    status = status.toLowerCase();
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleUnitToggle = (unit: string) => {
    unit = unit.toLowerCase();
    setUnitTypes((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const handleClearAll = () => {
    setSelectedProject("");
    setSelectedStatuses([]);
    setFromDate("");
    setToDate("");
    setMinBudget(0);
    setMaxBudget(0);
    setUnitTypes([]);
    // hide any inline shortlist UI (we navigate to shortlist page instead)
  };

  // Live filtering effect
  React.useEffect(() => {
    let result = leads;
    if (selectedProject) {
      result = result.filter((lead) => lead.project_name === selectedProject);
    }
    if (selectedStatuses.length > 0) {
      result = result.filter((lead) => selectedStatuses.includes(lead.lead_status.toLowerCase()));
    }
    if (minBudget) {
      result = result.filter((lead) =>
        (lead.min_budget !== null && lead.min_budget >= minBudget)
      );
    }
    if (maxBudget) {
      result = result.filter((lead) =>
        (lead.max_budget !== null && lead.max_budget <= maxBudget)
      );
    }
    if (unitTypes.length > 0) {
      result = result.filter((lead) =>
        lead.unit_type !== null && unitTypes.includes(lead.unit_type.toLowerCase())
      );
    }
    if (fromDate) {
      result = result.filter((lead) =>
        lead.last_conversation_date && new Date(lead.last_conversation_date) >= new Date(fromDate)
      );
    }
    if (toDate) {
      result = result.filter((lead) =>
        lead.last_conversation_date && new Date(lead.last_conversation_date) <= new Date(toDate)
      );
    }
    setFilteredLeads(result);
  }, [leads, selectedProject, selectedStatuses, minBudget, maxBudget, unitTypes, fromDate, toDate]);

  const navigate = useNavigate();
  const handleShortlist = () => {
    // navigate to shortlist page and pass filtered leads and projects via location state
    navigate("/shortlist", { state: { leads: filteredLeads, projects: uniqueProjects } });
  };
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (selectedProject) count++;
    if (selectedStatuses.length > 0) count++;
    if (fromDate || toDate) count++;
    // budget counts if either min or max is set (non-zero)
    if ((minBudget ?? 0) > 0 || (maxBudget ?? 0) > 0) count++;
    if (unitTypes.length > 0) count++;
    return count;
  }, [selectedProject, selectedStatuses, fromDate, toDate, minBudget, maxBudget, unitTypes]);

  if (loading) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
        </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Create New Campaign
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        Filter leads from your CRM to target for nurturing.
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Shortlist Leads for Campaign
          </Typography>

          {/* Project Name */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Project</InputLabel>
            <Select
              label="Select Project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <MenuItem value="">All Projects</MenuItem>
              {uniqueProjects.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Budget Range */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Budget Range
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                type="number"
                fullWidth
                label="Min budget"
                variant="outlined"
                value={minBudget}
                onChange={(e) => setMinBudget(Number(e.target.value))}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                type="number"
                fullWidth
                label="Max budget"
                variant="outlined"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Unit Type */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Unit Type
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unitTypes.includes("studio")}
                      onChange={() => handleUnitToggle("studio")}
                    />
                  }
                  label="Studio"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unitTypes.includes("2 bed")}
                      onChange={() => handleUnitToggle("2 bed")}
                    />
                  }
                  label="2 bed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unitTypes.includes("3 bed")}
                      onChange={() => handleUnitToggle("3 bed")}
                    />
                  }
                  label="3 bed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unitTypes.includes("duplex")}
                      onChange={() => handleUnitToggle("duplex")}
                    />
                  }
                  label="Duplex"
                />
              </FormGroup>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unitTypes.includes("1 bed")}
                      onChange={() => handleUnitToggle("1 bed")}
                    />
                  }
                  label="1 bed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unitTypes.includes("2 bed w study")}
                      onChange={() => handleUnitToggle("2 bed w study")}
                    />
                  }
                  label="2 bed w study"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unitTypes.includes("4 bed")}
                      onChange={() => handleUnitToggle("4 bed")}
                    />
                  }
                  label="4 bed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unitTypes.includes("penthouse")}
                      onChange={() => handleUnitToggle("penthouse")}
                    />
                  }
                  label="Penthouse"
                />
              </FormGroup>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Lead Status */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Lead Status (Select Multiple)
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {LEAD_STATUS_OPTIONS.map((status) => (
              <Grid size={{ xs: 6, sm: 4 }} key={status}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedStatuses.includes(status.toLowerCase())}
                      onChange={() => handleStatusChange(status)}
                    />
                  }
                  label={status}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Last Conversation Date Filter */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Last Conversation Date (Last 3 Years)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="From Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                inputProps={{
                  min: new Date(
                    new Date().setFullYear(new Date().getFullYear() - 3)
                  )
                    .toISOString()
                    .split("T")[0],
                  max: new Date().toISOString().split("T")[0],
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="To Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                inputProps={{
                  min: fromDate || undefined,
                  max: new Date().toISOString().split("T")[0],
                }}
              />
            </Grid>
          </Grid>
          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleShortlist}
              disabled={activeFilterCount < 2}
            >
              Shortlist Leads
            </Button>
          </Stack>

          {/* Filtered Leads Count */}
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Typography variant="subtitle1">
              Filtered Leads: {loading ? leads.length : filteredLeads.length}
            </Typography>
          </Box>

          {/* Shortlisted Leads DataGrid */}
          {/* {showShortlisted && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Shortlisted Leads
              </Typography>
              {filteredLeads.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No leads match the selected filters.
                </Typography>
              ) : (
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid<Lead>
                    rows={filteredLeads}
                    columns={[
                      { field: 'id', headerName: 'ID', flex: 0.3 },
                      { field: 'name', headerName: 'Name', flex: 1 },
                      { field: 'project_name', headerName: 'Project', flex: 1 },
                      { field: 'lead_status', headerName: 'Status', flex: 1 },
                      { field: 'unit_type', headerName: 'Unit Type', flex: 0.8 },
                      {
                        field: 'min_budget',
                        headerName: 'Min Budget',
                        flex: 0.6,
                        valueFormatter: (params) => {
                            if (!params) return '';
                            const num = parseFloat(params as string);
                            return isNaN(num) ? '' : `₹${num.toLocaleString('en-IN')}`;
                        },
                      },
                      {
                        field: 'max_budget',
                        headerName: 'Max Budget',
                        flex: 0.6,
                        valueFormatter: (params) => {
                            if (!params) return '';
                            const num = parseFloat(params as string);
                            return isNaN(num) ? '' : `₹${num.toLocaleString('en-IN')}`;
                        },
                      },
                      { field: 'last_conversation_date', headerName: 'Last Conversation', flex: 1 },
                    ]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    pageSizeOptions={[5, 10, 20]}
                    getRowId={(row: Lead) => row.id}
                  />
                </Box>
              )}
            </Box>
          )} */}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CampaignPage;
