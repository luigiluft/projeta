import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, differenceInDays, isBefore } from "date-fns";
import { Task } from "@/types/project";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  hourly_rate: number;
  daily_capacity: number;
}

interface Allocation {
  id?: string;
  project_id: string;
  member_id: string;
  task_id?: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface ResourceAvailability {
  member_id: string;
  member_name: string;
  position: string;
  available_dates: {
    date: string;
    available_hours: number;
  }[];
}

interface ProjectAllocation {
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

export function useResourceAllocation(projectId?: string) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Buscar membros da equipe
  const { data: teamMembers = [], isLoading: teamMembersLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) {
        console.error("Erro ao carregar membros da equipe:", error);
        throw error;
      }

      return data;
    },
  });

  // Buscar tarefas do projeto
  const { data: projectTasks = [], isLoading: projectTasksLoading } = useQuery({
    queryKey: ['projectTasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          id,
          task_id,
          tasks:task_id(*)
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error("Erro ao carregar tarefas do projeto:", error);
        throw error;
      }

      return data.map(pt => pt.tasks) as Task[];
    },
    enabled: !!projectId
  });

  // Buscar alocações existentes para o projeto
  const { data: projectAllocations = [], isLoading: allocationsLoading } = useQuery({
    queryKey: ['projectAllocations', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_allocations')
        .select(`
          id,
          project_id,
          member_id,
          task_id,
          start_date,
          end_date,
          allocated_hours,
          status,
          tasks:task_id(task_name),
          team_members:member_id(first_name, last_name, position)
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error("Erro ao carregar alocações:", error);
        throw error;
      }

      return data.map(allocation => ({
        ...allocation,
        member_first_name: allocation.team_members?.first_name,
        member_last_name: allocation.team_members?.last_name,
        member_position: allocation.team_members?.position,
        task_name: allocation.tasks?.task_name || "Sem tarefa"
      })) as ProjectAllocation[];
    },
    enabled: !!projectId
  });

  // Buscar disponibilidades da equipe
  const getAvailability = async (
    startDate: string, 
    endDate: string, 
    requiredHours: number,
    selectedMembers: string[] = []
  ): Promise<ResourceAvailability[]> => {
    try {
      setCheckingAvailability(true);
      
      // Converter datas para objetos Date
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Filtrar membros da equipe se especificados
      const membersToCheck = selectedMembers.length > 0
        ? teamMembers.filter(member => selectedMembers.includes(member.id))
        : teamMembers;
      
      // Buscar todas as alocações existentes para o período
      const { data: existingAllocations, error: allocationsError } = await supabase
        .from('project_allocations')
        .select('*')
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);
        
      if (allocationsError) {
        console.error("Erro ao buscar alocações existentes:", allocationsError);
        throw allocationsError;
      }
      
      // Calcular disponibilidade para cada membro
      const availability: ResourceAvailability[] = [];
      
      for (const member of membersToCheck) {
        const memberAllocations = existingAllocations.filter(
          alloc => alloc.member_id === member.id
        );
        
        const availableDates = [];
        let currentDate = new Date(start);
        
        // Calcular disponibilidade para cada dia no período
        while (currentDate <= end) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          const dailyCapacity = member.daily_capacity || 8; // Capacidade diária (horas)
          
          // Calcular horas já alocadas para este dia
          let allocatedHours = 0;
          
          memberAllocations.forEach(alloc => {
            const allocStart = new Date(alloc.start_date);
            const allocEnd = new Date(alloc.end_date);
            
            if (
              currentDate >= allocStart && 
              currentDate <= allocEnd
            ) {
              // Distribuir horas alocadas uniformemente pelos dias
              const allocDays = differenceInDays(allocEnd, allocStart) + 1;
              allocatedHours += alloc.allocated_hours / allocDays;
            }
          });
          
          // Calcular horas disponíveis
          const availableHours = Math.max(0, dailyCapacity - allocatedHours);
          
          availableDates.push({
            date: dateStr,
            available_hours: availableHours
          });
          
          currentDate = addDays(currentDate, 1);
        }
        
        availability.push({
          member_id: member.id,
          member_name: `${member.first_name} ${member.last_name}`,
          position: member.position,
          available_dates: availableDates
        });
      }
      
      // Ordenar por disponibilidade (do mais disponível para o menos disponível)
      return availability.sort((a, b) => {
        const totalAvailableA = a.available_dates.reduce((sum, date) => sum + date.available_hours, 0);
        const totalAvailableB = b.available_dates.reduce((sum, date) => sum + date.available_hours, 0);
        return totalAvailableB - totalAvailableA;
      });
      
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
      toast.error("Erro ao verificar disponibilidade da equipe");
      return [];
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Criar alocação
  const createAllocation = async (allocation: Allocation) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('project_allocations')
        .insert({
          project_id: allocation.project_id,
          member_id: allocation.member_id,
          task_id: allocation.task_id,
          start_date: allocation.start_date,
          end_date: allocation.end_date,
          allocated_hours: allocation.allocated_hours,
          status: allocation.status
        })
        .select();
          
      if (error) throw error;
      
      toast.success("Recurso alocado com sucesso");
      queryClient.invalidateQueries({ queryKey: ['projectAllocations', projectId] });
      return data?.[0];
    } catch (error: any) {
      console.error("Erro ao alocar recurso:", error);
      
      // Tratar erro específico de sobreposição
      if (error.message?.includes("Membro da equipe já possui alocação neste período")) {
        toast.error("Este membro já possui uma alocação no período selecionado");
      } else {
        toast.error("Erro ao alocar recurso");
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Excluir alocação
  const deleteAllocation = async (allocationId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('project_allocations')
        .delete()
        .eq('id', allocationId);
        
      if (error) throw error;
      
      toast.success("Alocação removida com sucesso");
      queryClient.invalidateQueries({ queryKey: ['projectAllocations', projectId] });
    } catch (error) {
      console.error("Erro ao remover alocação:", error);
      toast.error("Erro ao remover alocação");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sugerir datas de início para um novo projeto baseado na disponibilidade
  const suggestProjectDates = async (
    totalHours: number,
    memberCount: number = 1,
    earliestStartDate?: string
  ) => {
    try {
      setCheckingAvailability(true);
      
      // Data mais próxima para início (hoje ou a especificada)
      const startDate = earliestStartDate 
        ? new Date(earliestStartDate) 
        : new Date();
      
      // Buscar todas as alocações existentes
      const { data: existingAllocations, error: allocationsError } = await supabase
        .from('project_allocations')
        .select('*')
        .gte('start_date', format(startDate, 'yyyy-MM-dd'));
        
      if (allocationsError) {
        console.error("Erro ao buscar alocações existentes:", allocationsError);
        throw allocationsError;
      }
      
      // Dados de disponibilidade por membro e data
      const availability: Record<string, Record<string, number>> = {};
      
      // Inicializar disponibilidade para todos os membros
      for (const member of teamMembers) {
        availability[member.id] = {};
      }
      
      // Preencher dados de disponibilidade para os próximos 90 dias
      const endDate = addDays(startDate, 90);
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Para cada membro, calcular disponibilidade nesta data
        for (const member of teamMembers) {
          const dailyCapacity = member.daily_capacity || 8;
          
          // Calcular horas já alocadas para este membro nesta data
          let allocatedHours = 0;
          
          existingAllocations
            .filter(alloc => alloc.member_id === member.id)
            .forEach(alloc => {
              const allocStart = new Date(alloc.start_date);
              const allocEnd = new Date(alloc.end_date);
              
              if (
                currentDate >= allocStart && 
                currentDate <= allocEnd
              ) {
                // Distribuir horas alocadas uniformemente pelos dias
                const allocDays = differenceInDays(allocEnd, allocStart) + 1;
                allocatedHours += alloc.allocated_hours / allocDays;
              }
            });
          
          // Horas disponíveis neste dia para este membro
          availability[member.id][dateStr] = Math.max(0, dailyCapacity - allocatedHours);
        }
        
        currentDate = addDays(currentDate, 1);
      }
      
      // Encontrar a primeira data em que temos disponibilidade para os membros necessários
      currentDate = new Date(startDate);
      let suggestedStartDate = null;
      let suggestedEndDate = null;
      
      // Para cada data, verificar se temos capacidade suficiente
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Ordenar membros por disponibilidade nesta data (do mais disponível para o menos)
        const availableMembers = Object.entries(availability)
          .map(([memberId, dates]) => ({
            memberId,
            availableHours: dates[dateStr] || 0
          }))
          .filter(member => member.availableHours > 0)
          .sort((a, b) => b.availableHours - a.availableHours);
        
        // Se temos membros suficientes disponíveis
        if (availableMembers.length >= memberCount) {
          // Esta é a primeira data com disponibilidade
          if (!suggestedStartDate) {
            suggestedStartDate = new Date(currentDate);
          }
          
          // Calcular total de horas disponíveis neste dia
          const dailyCapacity = availableMembers
            .slice(0, memberCount)
            .reduce((sum, member) => sum + member.availableHours, 0);
          
          // Reduzir as horas restantes
          totalHours -= dailyCapacity;
          
          // Se já temos horas suficientes, esta é a data de fim
          if (totalHours <= 0) {
            suggestedEndDate = new Date(currentDate);
            break;
          }
        }
        
        currentDate = addDays(currentDate, 1);
      }
      
      // Se não encontramos uma data de fim, usar a data máxima
      if (!suggestedEndDate && suggestedStartDate) {
        suggestedEndDate = endDate;
      }
      
      // Se não encontramos nem início, sugerir usar o período máximo
      if (!suggestedStartDate) {
        suggestedStartDate = startDate;
        suggestedEndDate = endDate;
      }
      
      return {
        start_date: format(suggestedStartDate, 'yyyy-MM-dd'),
        end_date: format(suggestedEndDate, 'yyyy-MM-dd')
      };
      
    } catch (error) {
      console.error("Erro ao sugerir datas para o projeto:", error);
      return null;
    } finally {
      setCheckingAvailability(false);
    }
  };

  return {
    teamMembers,
    projectAllocations,
    projectTasks,
    loading,
    teamMembersLoading,
    projectTasksLoading,
    allocationsLoading,
    checkingAvailability,
    getAvailability,
    createAllocation,
    deleteAllocation,
    suggestProjectDates
  };
}
