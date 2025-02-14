
export interface Project {
  id: string;
  name: string;
  epic: string;
  type: string;
  created_at: string;
  total_hours: number;
  tasks: Task[];
  attributes: {
    [key: string]: string | number;
  };
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

export interface Attribute {
  id: string;
  name: string;
  unit: "hours" | "quantity" | "percentage";
  type: "number" | "list" | "text";
  defaultValue?: string;
}
