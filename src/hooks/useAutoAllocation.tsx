
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Task } from "@/types/project";

interface RoleAllocation {
  role: string;
  members: string[];
  tasks: Task[];
  totalHours: number;
}

interface AllocationResult {
  allocatedCount: number;
  notAllocatedCount: number;
  notAllocatedRoles: string[];
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
        if (totalCapacity - totalAllocatedHours >= totalHours * 0.25) { // Permitir dividir a carga
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
  ): Promise<AllocationResult> => {
    try {
      setLoading(true);

      // Agrupar tarefas por cargo do responsável
      const roleAllocations: Record<string, RoleAllocation> = {};
      
      tasks.forEach(task => {
        if (!task.owner) return;
        
        if (!roleAllocations[task.owner]) {
          roleAllocations[task.owner] = {
            role: task.owner,
            members: [],
            tasks: [],
            totalHours: 0
          };
        }
        
        roleAllocations[task.owner].tasks.push(task);
        // Adicionar horas da tarefa ao total do cargo
        roleAllocations[task.owner].totalHours += (
          task.calculated_hours || task.fixed_hours || 0
        );
      });

      let allocatedCount = 0;
      let notAllocatedCount = 0;
      const notAllocatedRoles: string[] = [];

      // Para cada cargo, encontrar membros disponíveis e fazer alocação
      for (const role of Object.keys(roleAllocations)) {
        const allocation = roleAllocations[role];
        
        // Não prosseguir se não houver horas para alocar
        if (allocation.totalHours <= 0) {
          continue;
        }

        const availableMembers = await findAvailableTeamMembers(role, startDate, endDate, allocation.totalHours);

        if (availableMembers.length === 0) {
          notAllocatedCount++;
          notAllocatedRoles.push(role);
          continue;
        }

        // Distribuir horas entre os membros disponíveis
        // Limitamos a no máximo 2 membros para evitar fragmentação excessiva
        const membersToUse = availableMembers.slice(0, 2);
        const hoursPerMember = allocation.totalHours / membersToUse.length;

        // Criar alocações para cada membro
        for (const member of membersToUse) {
          const { error } = await supabase
            .from('project_allocations')
            .insert({
              project_id: projectId,
              member_id: member.id,
              start_date: startDate,
              end_date: endDate,
              allocated_hours: Math.ceil(hoursPerMember), // Arredondar para cima
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
