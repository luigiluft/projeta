
import { useState } from "react";
import { useTeamMembers } from "./useTeamMembers";
import { useProjectTasks } from "./useProjectTasks";
import { useProjectAllocations } from "./useProjectAllocations";
import { useAllocationMutations } from "./useAllocationMutations";
import { getAvailability } from "./availabilityService";
import { Task } from "@/types/project";
import { toast } from "sonner";
import { format } from "date-fns";

export function useResourceAllocation(projectId?: string) {
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const teamMembersQuery = useTeamMembers();
  
  const projectTasksQuery = useProjectTasks(projectId);
  
  const projectAllocationsQuery = useProjectAllocations(projectId);

  const {
    loading,
    createAllocation,
    deleteAllocation
  } = useAllocationMutations();

  const checkAvailability = async (startDate: string, endDate: string, requiredHours: number = 0) => {
    setCheckingAvailability(true);
    try {
      const result = await getAvailability(startDate, endDate, requiredHours);
      return result;
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Implement the autoAllocateTeam function used by AutoAllocation component
  const autoAllocateTeam = async (
    projectId: string,
    tasks: Task[],
    startDate: string,
    endDate: string
  ) => {
    if (!projectId || !tasks?.length) {
      return { success: false, message: "Dados do projeto inválidos", allocationsCreated: 0 };
    }

    try {
      // Check if team members are available
      const availableMembers = await checkAvailability(startDate, endDate);
      if (!availableMembers || availableMembers.length === 0) {
        return { success: false, message: "Nenhum membro da equipe disponível", allocationsCreated: 0 };
      }

      // Only allocate to active tasks
      const activeTasks = tasks.filter(task => task.is_active);
      if (activeTasks.length === 0) {
        return { success: false, message: "Nenhuma tarefa ativa disponível", allocationsCreated: 0 };
      }

      let allocationsCreated = 0;

      // Simple allocation algorithm (this is a placeholder - in a real app this would be more sophisticated)
      for (const task of activeTasks) {
        // Skip tasks that don't have a task_id
        if (!task.id) continue;

        // Pick the first available team member
        const member = availableMembers[0];
        if (!member) continue;

        // Create an allocation for this task
        await createAllocation.mutateAsync({
          project_id: projectId,
          member_id: member.member_id,
          task_id: task.id,
          start_date: startDate,
          end_date: endDate,
          allocated_hours: 8, // Default allocation of 8 hours
          status: 'scheduled'
        });

        allocationsCreated++;
      }

      if (allocationsCreated > 0) {
        toast.success(`${allocationsCreated} alocações criadas com sucesso`);
        return { success: true, message: "Alocação automática concluída", allocationsCreated };
      } else {
        return { 
          success: false, 
          message: "Não foi possível criar alocações automáticas", 
          allocationsCreated: 0 
        };
      }
    } catch (error: any) {
      console.error("Erro na alocação automática:", error);
      return { 
        success: false, 
        message: error.message || "Erro desconhecido na alocação automática", 
        allocationsCreated: 0 
      };
    }
  };

  return {
    teamMembers: teamMembersQuery,
    projectTasks: projectTasksQuery,
    projectAllocations: projectAllocationsQuery,
    loading,
    checkingAvailability,
    getAvailability: checkAvailability,
    createAllocation,
    deleteAllocation,
    autoAllocateTeam // Add the new function to the returned object
  };
}

export * from "./types";
