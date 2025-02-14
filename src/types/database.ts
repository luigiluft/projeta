
export interface Project {
  id: string;
  name: string;
  type: string;
  created_at: string;
  total_hours: number;
  total_cost: number;
  base_cost: number;
  profit_margin: number;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  client_name: string | null;
  description: string | null;
  currency: 'BRL' | 'USD' | 'EUR';
  project_name: string;
  epic: string | null;
}

export interface ProjectAttribute {
  id: string;
  project_id: string;
  name: string;
  value: string;
  unit: string;
  created_at: string;
}

export interface ProjectSchedule {
  id: string;
  project_id: string;
  start_date: string;
  workday_hours: number;
  workday_start: string;
  workday_end: string;
  created_at: string;
}

export interface ProjectIntegration {
  id: string;
  project_id: string;
  integration_name: string;
  is_enabled: boolean;
  status: string | null;
  created_at: string;
}

export interface ProjectStats {
  project_id: string;
  project_name: string;
  status: string;
  total_tasks: number;
  total_hours: number;
  total_cost: number;
  base_cost: number;
  profit_margin: number;
  due_date: string | null;
  created_at: string;
}
