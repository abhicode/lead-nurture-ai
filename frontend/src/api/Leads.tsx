import client from "./client";

export interface Lead {
  id: number;
  lead_id: string;
  name: string;
  project_name: string;
  min_budget: number | null;
  max_budget: number | null;
  unit_type: string | null;
  lead_status: string;
  last_conversation_date: string;
}

export const getLeads = async (): Promise<Lead[]> => {
  const response = await client.get(`/crm/leads`);
  return response.data;
};
