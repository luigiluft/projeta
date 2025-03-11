
export interface ResourceAvailability {
  member_id: string;
  member_name: string;
  position: string;
  available_dates: {
    date: string;
    available_hours: number;
    allocated_hours?: number;
    total_capacity?: number;
  }[];
}

export interface Allocation {
  id?: string;
  project_id: string;
  member_id: string;
  task_id?: string | null;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface ProjectAllocation extends Allocation {
  member_first_name?: string;
  member_last_name?: string;
  member_position?: string;
  task_name?: string;
}
