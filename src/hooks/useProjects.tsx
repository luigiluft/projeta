
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
              // Buscar tarefas relacionadas ao projeto da nova tabela project_tasks
              const { data: projectTasksData, error: projectTasksError } = await supabase
                .from('project_tasks')
                .select(`
                  id,
                  calculated_hours,
                  is_active,
                  status,
                  start_date,
                  end_date,
                  tasks:task_id(*)
                `)
                .eq('project_id', project.id);

              if (projectTasksError) {
                console.error(`Erro ao carregar tarefas do projeto ${project.id}:`, projectTasksError);
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

              // Extrair e formatar as tarefas do projeto
              let allTasks: Task[] = [];
              
              if (projectTasksData && projectTasksData.length > 0) {
                allTasks = projectTasksData.map((ptask, index) => {
                  const task = ptask.tasks as any;
                  return {
                    ...task,
                    order_number: index + 1,
                    is_active: ptask.is_active,
                    phase: task.phase || '',
                    epic: task.epic || '',
                    story: task.story || '',
                    owner: task.owner || '',
                    calculated_hours: ptask.calculated_hours, // Usar o valor calculado armazenado na tabela project_tasks
                    status: ptask.status as "pending" | "in_progress" | "completed",
                    project_task_id: ptask.id // Referência ao id da tabela de relacionamento
                  } as Task;
                });
              } else {
                // Se não houver tarefas associadas, verificar se há epics associados 
                // e buscar tarefas baseadas nos epics (compatibilidade com projetos antigos)
                const epicList = project.epic ? project.epic.split(', ') : [];
                
                for (const epic of epicList) {
                  try {
                    const { data: tasksData, error: tasksError } = await supabase
                      .from('tasks')
                      .select('*')
                      .eq('epic', epic);

                    if (tasksError) {
                      console.error(`Erro ao carregar tarefas do epic ${epic}:`, tasksError);
                      continue;
                    }

                    if (tasksData && tasksData.length > 0) {
                      const tasks = tasksData.map((task, index) => ({
                        ...task,
                        order_number: allTasks.length + index + 1,
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
      // 1. Criar o projeto
      const { data: projectData, error: projectError } = await supabase
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
        }])
        .select();

      if (projectError) throw projectError;
      
      // 2. Adicionar tarefas na tabela de relacionamento
      if (projectData && projectData.length > 0) {
        const projectId = projectData[0].id;
        
        // Preparar os dados para a tabela project_tasks
        const projectTasks = selectedTasks.map(task => {
          // Calcular as horas com base na fórmula ou usar horas fixas
          let calculatedHours = 0;
          
          if (task.hours_formula) {
            try {
              let formula = task.hours_formula;
              // Substituir os atributos pelos seus valores na fórmula
              Object.entries(attributeValues).forEach(([key, value]) => {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                formula = formula.replace(regex, value.toString());
              });
              
              const result = eval(formula);
              calculatedHours = isNaN(result) ? 0 : result;
            } catch (e) {
              console.error(`Erro ao calcular fórmula para tarefa ${task.id}:`, e);
              calculatedHours = 0;
            }
          } else if (task.fixed_hours) {
            calculatedHours = task.fixed_hours;
          }
          
          return {
            project_id: projectId,
            task_id: task.id,
            calculated_hours: calculatedHours,
            is_active: true,
            status: 'pending'
          };
        });
        
        // Inserir na tabela project_tasks
        const { error: tasksError } = await supabase
          .from('project_tasks')
          .insert(projectTasks);
          
        if (tasksError) {
          console.error("Erro ao adicionar tarefas ao projeto:", tasksError);
          toast.error("Erro ao registrar tarefas do projeto");
        }
      }

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
