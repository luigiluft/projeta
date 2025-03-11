
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Task } from "@/types/project";

export function useAutoAllocation() {
  const [loading, setLoading] = useState(false);

  // Função para encontrar membro da equipe disponível para a tarefa
  const findAvailableTeamMember = async (
    task: Task,
    startDate: string,
    endDate: string,
    allocatedHours: number
  ) => {
    try {
      // Buscar membros da equipe que correspondem ao cargo/posição do responsável da tarefa
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('position', task.owner)
        .eq('status', 'active');

      if (teamError) throw teamError;
      
      if (!teamMembers || teamMembers.length === 0) {
        console.log(`Nenhum membro da equipe encontrado com o cargo ${task.owner}`);
        return null;
      }

      // Para cada membro, verificar disponibilidade no período
      for (const member of teamMembers) {
        // Verificar alocações existentes para o período
        const { data: existingAllocations, error: allocError } = await supabase
          .from('project_allocations')
          .select('allocated_hours')
          .eq('member_id', member.id)
          .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

        if (allocError) throw allocError;

        // Calcular total de horas já alocadas
        const totalAllocatedHours = existingAllocations?.reduce(
          (sum, alloc) => sum + (alloc.allocated_hours || 0), 
          0
        ) || 0;

        // Calcular total de dias úteis no período
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const dayDiff = Math.max(1, Math.round((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Considerando apenas dias úteis (5 dias por semana em média)
        const workDays = Math.ceil(dayDiff * 5/7);
        
        // Capacidade total do membro no período
        const totalCapacity = workDays * member.daily_capacity;
        
        // Se membro tem capacidade suficiente, retorná-lo
        if (totalCapacity - totalAllocatedHours >= allocatedHours) {
          return member;
        }
      }

      // Se nenhum membro disponível for encontrado
      return null;
    } catch (error) {
      console.error("Erro ao buscar membro disponível:", error);
      throw error;
    }
  };

  // Função para alocar automaticamente membros da equipe para as tarefas de um projeto
  const autoAllocateTeam = async (
    projectId: string, 
    tasks: Task[], 
    startDate: string,
    endDate: string
  ) => {
    try {
      setLoading(true);

      let allocatedCount = 0;
      let notAllocatedCount = 0;
      const notAllocatedTasks: string[] = [];

      // Iterar sobre todas as tarefas
      for (const task of tasks) {
        // Ignorar tarefas sem responsável definido
        if (!task.owner) {
          notAllocatedCount++;
          notAllocatedTasks.push(task.task_name);
          continue;
        }

        // Calcular horas alocadas com base nas horas calculadas ou fixas da tarefa
        const allocatedHours = task.calculated_hours || task.fixed_hours || 0;
        
        if (allocatedHours <= 0) {
          notAllocatedCount++;
          notAllocatedTasks.push(task.task_name);
          continue;
        }

        // Encontrar membro disponível
        const member = await findAvailableTeamMember(task, startDate, endDate, allocatedHours);
        
        if (!member) {
          notAllocatedCount++;
          notAllocatedTasks.push(task.task_name);
          continue;
        }

        // Criar alocação
        const { error } = await supabase
          .from('project_allocations')
          .insert({
            project_id: projectId,
            task_id: task.id,
            member_id: member.id,
            start_date: startDate,
            end_date: endDate,
            allocated_hours: allocatedHours,
            status: 'scheduled'
          });

        if (error) {
          console.error(`Erro ao alocar membro para tarefa ${task.task_name}:`, error);
          notAllocatedCount++;
          notAllocatedTasks.push(task.task_name);
        } else {
          allocatedCount++;
        }
      }

      setLoading(false);

      // Retornar resumo da alocação
      return {
        allocatedCount,
        notAllocatedCount,
        notAllocatedTasks
      };
    } catch (error) {
      setLoading(false);
      console.error("Erro na alocação automática:", error);
      throw error;
    }
  };

  return {
    loading,
    autoAllocateTeam
  };
}
