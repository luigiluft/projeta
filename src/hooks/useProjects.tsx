
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

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (projectsError) {
        toast.error('Erro ao carregar projetos');
        throw projectsError;
      }

      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project) => {
          // Lidar com múltiplos epics
          const epicList = project.epic ? project.epic.split(', ') : [];
          
          let allTasks: Task[] = [];
          
          // Buscar tarefas para cada epic
          for (const epic of epicList) {
            const { data: tasksData, error: tasksError } = await supabase
              .from('tasks')
              .select('*')
              .eq('epic', epic);

            if (tasksError) {
              toast.error(`Erro ao carregar tarefas do epic ${epic}`);
              throw tasksError;
            }

            if (tasksData && tasksData.length > 0) {
              const tasks = tasksData.map((task, index) => ({
                ...task,
                order_number: allTasks.length + index + 1, // Ordem contínua para todos os epics
                is_active: task.is_active || true,
                phase: task.phase || '',
                epic: task.epic || '',
                story: task.story || '',
                owner: task.owner || '',
                status: (task.status as "pending" | "in_progress" | "completed") || "pending",
              })) as Task[];
              
              allTasks = [...allTasks, ...tasks];
            }
          }

          // Extrair valores dos atributos
          const attributeValues = project.metadata?.attribute_values || {};

          return {
            ...project,
            tasks: allTasks,
            favorite: project.favorite || false,
            priority: project.priority || 0,
            tags: project.tags || [],
            archived: project.archived || false,
            deleted: project.deleted || false,
            version: project.version || 1,
            metadata: project.metadata || {},
            settings: project.settings || {},
            attribute_values: attributeValues
          } as Project;
        })
      );

      return projectsWithTasks;
    },
  });

  const calculateProjectCosts = (tasks: Task[], attributeValues: Record<string, number> = {}) => {
    let totalHours = 0;
    let totalCost = 0;

    tasks.forEach(task => {
      if (task.hours_formula) {
        try {
          // Substituir atributos com valores
          let formula = task.hours_formula;
          Object.entries(attributeValues).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            formula = formula.replace(regex, value.toString());
          });
          
          // Calcular horas
          const calculatedHours = eval(formula);
          const hours = isNaN(calculatedHours) ? 0 : calculatedHours;
          
          totalHours += hours;
          const hourlyRate = ROLE_RATES[task.owner as keyof typeof ROLE_RATES] || 0;
          totalCost += hours * hourlyRate;
        } catch (error) {
          console.error('Erro ao calcular fórmula:', task.hours_formula, error);
        }
      }
    });

    const profitMargin = 30.00; // 30%
    const finalCost = totalCost * (1 + profitMargin / 100);

    return {
      baseCost: totalCost,
      totalCost: finalCost,
      totalHours,
      profitMargin
    };
  };

  const handleSubmit = async (selectedTasks: Task[], attributeValues: Record<string, number> = {}) => {
    if (selectedTasks.length === 0) {
      toast.error("Selecione pelo menos uma tarefa");
      return;
    }

    // Para múltiplos epics
    const epics = Array.from(new Set(selectedTasks.map(task => task.epic))).filter(Boolean);
    const epicNames = epics.join(', ');
    
    const costs = calculateProjectCosts(selectedTasks, attributeValues);

    try {
      const { error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: epicNames,
          epic: epicNames,
          type: 'default',
          total_hours: costs.totalHours,
          base_cost: costs.baseCost,
          total_cost: costs.totalCost,
          profit_margin: costs.profitMargin,
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
          metadata: { attribute_values: attributeValues },
          settings: {},
          project_name: epicNames,
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
