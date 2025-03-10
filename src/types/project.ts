
export interface Project {
  id: string;
  name: string;
  project_name: string;
  epic: string;
  type: string;
  created_at: string;
  updated_at: string;
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
  attribute_values?: Record<string, number>; // Novo campo para valores dos atributos
  client_id?: string;
  workspace_id?: string;
  team_id?: string;
  owner_id?: string;
  category_id?: string;
  favorite: boolean;
  priority: number;
  tags: string[];
  archived: boolean;
  archived_at?: string;
  deleted: boolean;
  deleted_at?: string;
  version: number;
  metadata: Record<string, any>;
  settings: Record<string, any>;
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
  hours_formula?: string;
  fixed_hours?: number;
  hours_type?: string;
  calculated_hours?: number; // Campo para armazenar o resultado do cálculo
  owner: string;
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed';
  start_date?: string;
  end_date?: string;
  estimated_completion_date?: string;
  depends_on?: string;
  
  // Campos adicionados para compatibilidade com os dados do banco
  order?: number; // Para compatibilidade com o campo 'order' do banco
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
