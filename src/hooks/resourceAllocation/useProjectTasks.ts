
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/project";

export function useProjectTasks(projectId?: string) {
  return useQuery({
    queryKey: ['resourceAllocationTasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          id,
          task_id,
          tasks:task_id(*),
          start_date,
          end_date
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error("Erro ao carregar tarefas do projeto:", error);
        throw error;
      }

      return data.map(pt => {
        const task = pt.tasks as Task;
        return {
          ...task,
          start_date: pt.start_date,
          end_date: pt.end_date,
          project_task_id: pt.id
        };
      }) as Task[];
    },
    enabled: !!projectId
  });
}
