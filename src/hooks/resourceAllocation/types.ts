
export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  hourly_rate: number;
  daily_capacity: number;
}

export interface Allocation {
  id?: string;
  project_id: string;
  member_id: string;
  task_id?: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ResourceAvailability {
  member_id: string;
  member_name: string;
  position: string;
  available_dates: {
    date: string;
    available_hours: number;
  }[];
}

export interface ProjectAllocation {
  id: string;
  project_id: string;
  member_id: string;
  task_id?: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: string;
  member_first_name?: string;
  member_last_name?: string;
  member_position?: string;
  task_name?: string;
}
