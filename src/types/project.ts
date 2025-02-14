export interface Project {
  id: string;
  name: string;
  project_name: string;
  epic: string;
  type: string;
  created_at: string;
  total_hours: number;
  total_cost: number;
  base_cost: number;
  profit_margin: number;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  client_name?: string;
  description?: string;
  currency: 'BRL' | 'USD' | 'EUR';
  tasks: Task[];
  start_date?: string;
  expected_end_date?: string;
  progress: number;
  delay_days: number;
  attributes: {
    [key: string]: string | number;
  };
}

export interface Task {
  id: string;
  order_number: number;
  is_active: boolean;
  is_new?: boolean;
  is_modified?: boolean;
  phase: string;
  epic: string;
  story: string;
  task_name: string;
  hours: number;
  owner: string;
  dependency: string | null;
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed';
  start_date?: string;
  end_date?: string;
  actual_hours: number;
  estimated_completion_date?: string;
}

export interface Column {
  id: string;
  label: string;
  visible: boolean;
}

export interface View {
  id: string;
  name: string;
  columns: Column[];
}

export interface Attribute {
  id: string;
  name: string;
  unit: "hours" | "quantity" | "percentage";
  type: "number" | "list" | "text";
  defaultValue?: string;
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
  progress: number;
  delay_days: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  hours_accuracy: number;
}
