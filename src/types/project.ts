
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
}
