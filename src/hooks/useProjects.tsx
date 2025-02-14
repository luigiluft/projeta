
import { useState } from "react";
import { Project, Task, View } from "@/types/project";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjects = () => {
  const [savedViews, setSavedViews] = useState<View[]>([]);
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        toast.error('Erro ao carregar projetos');
        throw projectsError;
      }

      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project) => {
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('epic', project.epic);

          if (tasksError) {
            toast.error(`Erro ao carregar tarefas do projeto ${project.epic}`);
            throw tasksError;
          }

          return {
            ...project,
            tasks: tasks || [],
          };
        })
      );

      return projectsWithTasks as Project[];
    },
  });

  const handleSubmit = async (selectedTasks: Task[]) => {
    if (selectedTasks.length === 0) {
      toast.error("Selecione pelo menos uma tarefa");
      return;
    }

    const epic = selectedTasks[0].epic;
    const totalHours = selectedTasks.reduce((sum, task) => sum + (task.hours || 0), 0);
    // Calcula um custo base por hora (pode ser ajustado conforme necessário)
    const hourlyRate = 150; // R$ 150 por hora
    const totalCost = totalHours * hourlyRate;

    try {
      const { error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: epic,
          epic,
          type: 'default',
          total_hours: totalHours,
          total_cost: totalCost,
        }]);

      if (projectError) throw projectError;

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Projeto criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar projeto");
      console.error(error);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Atualiza a lista de projetos após a exclusão
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      toast.error("Erro ao excluir projeto");
      console.error(error);
      throw error;
    }
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    const newView = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: [],
    };
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  return {
    projects,
    savedViews,
    handleSubmit,
    handleDelete,
    handleSaveView,
  };
};
