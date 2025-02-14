
export interface Project {
  id: string;
  epic: string;
  created_at: string;
  total_hours: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  order_number: number;
  is_active: boolean;
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
