
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Task } from "@/types/project";

interface RoleAllocation {
  role: string;
  members: string[];
  tasks: Task[];
}

export function useAutoAllocation() {
  const [loading, setLoading] = useState(false);

  // Função para encontrar membros da equipe disponíveis para um cargo
  const findAvailableTeamMembers = async (
    role: string,
    startDate: string,
    endDate: string,
    totalHours: number
  ) => {
    try {
      // Buscar membros da equipe que correspondem ao cargo
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('position', role)
        .eq('status', 'active');

      if (teamError) throw teamError;
      
      if (!teamMembers || teamMembers.length === 0) {
        console.log(`Nenhum membro da equipe encontrado com o cargo ${role}`);
        return [];
      }

      const availableMembers = [];

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
        
        // Se membro tem capacidade disponível, adicioná-lo à lista
        if (totalCapacity - totalAllocatedHours >= totalHours * 0.5) { // Permitir dividir a carga
          availableMembers.push({
            ...member,
            availableHours: totalCapacity - totalAllocatedHours
          });
        }
      }

      return availableMembers;
    } catch (error) {
      console.error("Erro ao buscar membros disponíveis:", error);
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

      // Agrupar tarefas por cargo do responsável
      const roleAllocations: { [key: string]: RoleAllocation } = {};
      
      tasks.forEach(task => {
        if (!task.owner) return;
        
        if (!roleAllocations[task.owner]) {
          roleAllocations[task.owner] = {
            role: task.owner,
            members: [],
            tasks: []
          };
        }
        
        roleAllocations[task.owner].tasks.push(task);
      });

      let allocatedCount = 0;
      let notAllocatedCount = 0;
      const notAllocatedRoles: string[] = [];

      // Para cada cargo, encontrar membros disponíveis e fazer alocação
      for (const role of Object.keys(roleAllocations)) {
        const allocation = roleAllocations[role];
        const totalHours = allocation.tasks.reduce((sum, task) => 
          sum + (task.calculated_hours || task.fixed_hours || 0), 0);

        const availableMembers = await findAvailableTeamMembers(role, startDate, endDate, totalHours);

        if (availableMembers.length === 0) {
          notAllocatedCount += allocation.tasks.length;
          notAllocatedRoles.push(role);
          continue;
        }

        // Distribuir horas entre os membros disponíveis
        const hoursPerMember = totalHours / availableMembers.length;

        // Criar alocações para cada membro
        for (const member of availableMembers) {
          const { error } = await supabase
            .from('project_allocations')
            .insert({
              project_id: projectId,
              member_id: member.id,
              start_date: startDate,
              end_date: endDate,
              allocated_hours: hoursPerMember,
              status: 'scheduled'
            });

          if (error) {
            console.error(`Erro ao alocar membro ${member.first_name}:`, error);
            notAllocatedCount++;
          } else {
            allocatedCount++;
          }
        }
      }

      setLoading(false);

      // Retornar resumo da alocação
      return {
        allocatedCount,
        notAllocatedCount,
        notAllocatedRoles
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
