
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, parseISO, isWeekend } from "date-fns";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  hourly_rate: number;
  daily_capacity: number;
  email?: string;
  status?: string;
}

interface TaskInterface {
  id: string;
  task_name: string;
  phase: string;
  epic: string;
  story?: string;
  hours?: number;
  fixed_hours?: number;
  hours_formula?: string;
  status: string;
}

interface ProjectAllocation {
  id: string;
  project_id: string;
  member_id: string;
  member_first_name: string;
  member_last_name: string;
  member_position: string;
  task_id?: string;
  task_name?: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: string;
}

interface AllocationFormData {
  project_id: string;
  member_id: string;
  task_id?: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: string;
}

export function useResourceAllocation(projectId?: string) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projectTasks, setProjectTasks] = useState<TaskInterface[]>([]);
  const [projectAllocations, setProjectAllocations] = useState<ProjectAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembersLoading, setTeamMembersLoading] = useState(true);
  const [allocationsLoading, setAllocationsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProjectTasks();
      fetchProjectAllocations();
    }
  }, [projectId]);

  async function fetchTeamMembers() {
    try {
      setTeamMembersLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('status', 'active')
        .order('position', { ascending: true })
        .order('first_name', { ascending: true });

      if (error) throw error;
      
      setTeamMembers(data || []);
    } catch (err) {
      console.error('Error loading team members:', err);
      setError(err instanceof Error ? err : new Error('Failed to load team members'));
      toast.error("Erro ao carregar membros da equipe");
    } finally {
      setTeamMembersLoading(false);
      setLoading(false);
    }
  }

  async function fetchProjectTasks() {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          id,
          task_id,
          tasks:task_id (
            id,
            task_name,
            phase,
            epic,
            story,
            hours_formula,
            fixed_hours,
            status
          )
        `)
        .eq('project_id', projectId)
        .eq('is_active', true);

      if (error) throw error;

      const formattedTasks = data?.map(item => ({
        id: item.tasks.id,
        task_name: item.tasks.task_name,
        phase: item.tasks.phase,
        epic: item.tasks.epic,
        story: item.tasks.story,
        hours: item.tasks.fixed_hours,
        hours_formula: item.tasks.hours_formula,
        status: item.tasks.status
      })) || [];

      setProjectTasks(formattedTasks);
    } catch (err) {
      console.error('Error loading project tasks:', err);
      toast.error("Erro ao carregar tarefas do projeto");
    }
  }

  async function fetchProjectAllocations() {
    if (!projectId) return;
    
    try {
      setAllocationsLoading(true);
      const { data, error } = await supabase
        .from('project_allocations')
        .select(`
          *,
          team_members:member_id (
            first_name,
            last_name,
            position
          ),
          tasks:task_id (
            task_name
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      const formattedAllocations = data?.map(allocation => ({
        id: allocation.id,
        project_id: allocation.project_id,
        member_id: allocation.member_id,
        member_first_name: allocation.team_members?.first_name,
        member_last_name: allocation.team_members?.last_name,
        member_position: allocation.team_members?.position,
        task_id: allocation.task_id,
        task_name: allocation.tasks?.task_name,
        start_date: allocation.start_date,
        end_date: allocation.end_date,
        allocated_hours: allocation.allocated_hours,
        status: allocation.status
      })) || [];

      setProjectAllocations(formattedAllocations);
    } catch (err) {
      console.error('Error loading allocations:', err);
      toast.error("Erro ao carregar alocações do projeto");
    } finally {
      setAllocationsLoading(false);
    }
  }

  async function createAllocation(data: AllocationFormData) {
    try {
      const { error } = await supabase
        .from('project_allocations')
        .insert([data]);

      if (error) throw error;
      
      fetchProjectAllocations();
      return true;
    } catch (err) {
      console.error('Error creating allocation:', err);
      toast.error("Erro ao criar alocação");
      throw err;
    }
  }

  async function deleteAllocation(id: string) {
    try {
      const { error } = await supabase
        .from('project_allocations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchProjectAllocations();
      return true;
    } catch (err) {
      console.error('Error deleting allocation:', err);
      toast.error("Erro ao remover alocação");
      throw err;
    }
  }

  async function getAvailability(
    startDate: string, 
    endDate: string, 
    fallbackHours: number = 8
  ) {
    try {
      // Verificar se o formato das datas está correto
      const parsedStartDate = parseISO(startDate);
      const parsedEndDate = parseISO(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error("Formato de data inválido");
      }

      const { data: availabilityData, error: availabilityError } = await supabase
        .from('team_availability')
        .select('*')
        .lte('start_date', endDate)
        .gte('end_date', startDate);

      if (availabilityError) throw availabilityError;

      // Obter todos os membros da equipe
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('status', 'active');
      
      if (membersError) throw membersError;

      return members.map(member => {
        // Encontrar registro de disponibilidade específico para o membro
        const memberAvailability = availabilityData?.filter(
          a => a.member_id === member.id
        ) || [];
        
        // Gerar datas entre início e fim
        const dates = [];
        let currentDate = new Date(parsedStartDate);
        const endDateObj = new Date(parsedEndDate);
        
        while (currentDate <= endDateObj) {
          // Pular fins de semana
          if (!isWeekend(currentDate)) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const matchingAvailability = memberAvailability.find(a => {
              const availStartDate = new Date(a.start_date);
              const availEndDate = new Date(a.end_date);
              return currentDate >= availStartDate && currentDate <= availEndDate;
            });
            
            dates.push({
              date: dateStr,
              available_hours: matchingAvailability ? 
                matchingAvailability.daily_hours : 
                member.daily_capacity || fallbackHours
            });
          }
          
          currentDate = addDays(currentDate, 1);
        }
        
        return {
          member_id: member.id,
          member_name: `${member.first_name} ${member.last_name}`,
          position: member.position,
          hourly_rate: member.hourly_rate,
          available_dates: dates
        };
      });
    } catch (err) {
      console.error('Error getting availability:', err);
      throw err;
    }
  }

  return { 
    teamMembers, 
    projectTasks, 
    projectAllocations, 
    loading, 
    teamMembersLoading, 
    allocationsLoading, 
    error, 
    createAllocation, 
    deleteAllocation, 
    getAvailability, 
    fetchTeamMembers, 
    fetchProjectTasks, 
    fetchProjectAllocations
  };
}
