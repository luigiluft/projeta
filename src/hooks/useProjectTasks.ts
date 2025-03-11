
import { useState } from "react";
import { Task, Column } from "@/types/project";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectTasks = (projectId?: string) => {
  return useQuery({
    queryKey: ['projectTasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          id,
          project_id,
          task_id,
          calculated_hours,
          is_active,
          status,
          start_date,
          end_date,
          owner_id,
          tasks:task_id(*)
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error("Erro ao carregar tarefas do projeto:", error);
        throw error;
      }

      // Format the tasks
      const formattedTasks = data.map((ptask, index) => {
        const task = ptask.tasks as any;
        return {
          ...task,
          id: task.id,
          order_number: index + 1,
          is_active: ptask.is_active,
          phase: task.phase || '',
          epic: task.epic || '',
          story: task.story || '',
          owner: task.owner || ptask.owner_id || '',
          calculated_hours: ptask.calculated_hours,
          status: ptask.status as "pending" | "in_progress" | "completed",
          project_task_id: ptask.id
        } as Task;
      });

      return formattedTasks;
    },
    enabled: !!projectId
  });
};
