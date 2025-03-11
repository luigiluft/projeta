
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectAllocation } from "./types";

export function useProjectAllocations(projectId?: string) {
  return useQuery({
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
}
