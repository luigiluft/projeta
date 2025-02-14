
import { useState } from "react";
import { Project, Task, View } from "@/types/project";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ROLE_RATES = {
  "BK": 78.75,
  "DS": 48.13,
  "PMO": 87.50,
  "PO": 35.00,
  "CS": 48.13,
  "FRJ": 70.00,
  "FRP": 119.00,
  "BKT": 131.04,
  "ATS": 65.85,
};

export const useProjects = () => {
  const [savedViews, setSavedViews] = useState<View[]>([]);
  const queryClient = useQueryClient();

  const calculateProjectCosts = (tasks: Task[]) => {
    const baseCost = tasks.reduce((sum, task) => {
      const hourlyRate = ROLE_RATES[task.owner as keyof typeof ROLE_RATES] || 0;
      return sum + (task.hours * hourlyRate);
    }, 0);

    const profitMargin = 30.00; // 30%
    const totalCost = baseCost * (1 + profitMargin / 100);
    const totalHours = tasks.reduce((sum, task) => sum + (task.hours || 0), 0);

    return {
      baseCost,
      totalCost,
      totalHours,
      profitMargin
    };
  };

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('deleted', false) // Only fetch non-deleted projects
        .order('created_at', { ascending: false });

      if (projectsError) {
        toast.error('Erro ao carregar projetos');
        throw projectsError;
      }

      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project) => {
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('epic', project.epic);

          if (tasksError) {
            toast.error(`Erro ao carregar tarefas do projeto ${project.epic}`);
            throw tasksError;
          }

          const tasks = (tasksData || []).map(task => ({
            ...task,
            status: (task.status as "pending" | "in_progress" | "completed") || "pending"
          }));

          const costs = calculateProjectCosts(tasks);

          return {
            ...project,
            tasks,
            total_hours: costs.totalHours,
            base_cost: costs.baseCost,
            total_cost: costs.totalCost,
            profit_margin: costs.profitMargin,
            favorite: project.favorite || false,
            priority: project.priority || 0,
            tags: project.tags || [],
            archived: project.archived || false,
            deleted: project.deleted || false,
            version: project.version || 1,
            metadata: project.metadata || {},
            settings: project.settings || {},
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
    const costs = calculateProjectCosts(selectedTasks);

    try {
      const { error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: epic,
          epic,
          type: 'default',
          total_hours: costs.totalHours,
          base_cost: costs.baseCost,
          profit_margin: costs.profitMargin,
          total_cost: costs.totalCost,
          status: 'draft',
          currency: 'BRL',
          progress: 0,
          delay_days: 0,
          favorite: false,
          priority: 0,
          tags: [],
          archived: false,
          deleted: false,
          version: 1,
          metadata: {},
          settings: {},
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
        .update({
          deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Projeto excluído com sucesso");
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
