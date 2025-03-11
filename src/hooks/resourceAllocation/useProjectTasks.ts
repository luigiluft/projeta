
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/project";

export function useProjectTasks(projectId?: string) {
  return useQuery({
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
}
