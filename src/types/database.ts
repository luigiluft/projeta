
export interface Project {
  id: string;
  name: string;
  type: string;
  created_at: string;
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
