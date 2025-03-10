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

  const { data: projects = [], isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error("Erro ao buscar projetos:", projectsError);
          return []; // Retorna array vazio em caso de erro
        }

        if (!projectsData || projectsData.length === 0) {
          return []; // Retorna array vazio se não houver projetos
        }

        const projectsWithTasks = await Promise.all(
          projectsData.map(async (project) => {
            try {
              // Lidar com múltiplos epics
              const epicList = project.epic ? project.epic.split(', ') : [];
              
              let allTasks: Task[] = [];
              
              // Buscar tarefas para cada epic
              for (const epic of epicList) {
                try {
                  const { data: tasksData, error: tasksError } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('epic', epic);

                  if (tasksError) {
                    console.error(`Erro ao carregar tarefas do epic ${epic}:`, tasksError);
                    continue; // Pula para o próximo epic em caso de erro
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
                } catch (e) {
                  console.error(`Erro ao processar tarefas para epic ${epic}:`, e);
                }
              }

              // Extrair valores dos atributos do campo metadata
              let attributeValues: Record<string, number> = {};
              
              if (project.metadata && typeof project.metadata === 'object') {
                // Verifica se metadata é um objeto e se contém attribute_values
                const metadata = project.metadata as Record<string, any>;
                if (metadata.attribute_values && typeof metadata.attribute_values === 'object') {
                  attributeValues = metadata.attribute_values as Record<string, number>;
                }
              }

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
            } catch (e) {
              console.error(`Erro ao processar projeto ${project.id}:`, e);
              return {
                ...project,
                tasks: [],
                favorite: project.favorite || false,
                priority: project.priority || 0,
                tags: project.tags || [],
                archived: project.archived || false,
                deleted: project.deleted || false,
                version: project.version || 1,
                metadata: project.metadata || {},
                settings: project.settings || {},
                attribute_values: {}
              } as Project;
            }
          })
        );

        return projectsWithTasks;
      } catch (error) {
        console.error("Erro não tratado ao carregar projetos:", error);
        return []; // Retorna array vazio em caso de erro
      }
    },
    meta: {
      onError: (error: Error) => {
        console.error("Erro na query de projetos:", error);
        // Não mostrar toast de erro para não irritar o usuário
      }
    }
  });

  const calculateProjectCosts = (tasks: Task[], attributeValues: Record<string, number> = {}) => {
    let totalHours = 0;
    let totalCost = 0;

    tasks.forEach(task => {
      if (task.hours_formula) {
        try {
          let formula = task.hours_formula;
          Object.entries(attributeValues).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            formula = formula.replace(regex, value.toString());
          });
          
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
    isError,
    handleSubmit,
    handleDelete,
    handleSaveView,
  };
};
