
import { useQuery } from "@tanstack/react-query";
import { Project, Task } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { calculateCosts } from "@/components/Projects/utils/taskCalculations";

// Hook para buscar projetos do Supabase
export const useProjectsQuery = () => {
  return useQuery({
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
                  owner_id,
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
                    owner: task.owner || ptask.owner_id || '', // Podemos usar owner_id da project_tasks também
                    calculated_hours: ptask.calculated_hours || task.fixed_hours || 0, // Usar o valor calculado armazenado ou hours_fixed
                    status: ptask.status as "pending" | "in_progress" | "completed",
                    project_task_id: ptask.id // Referência ao id da tabela de relacionamento
                  } as Task;
                });
              } else {
                // Compatibilidade com projetos antigos
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
                        calculated_hours: task.fixed_hours || 0, // Usar hours_fixed como fallback
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

              // Calcular horas e custos totais com base nas tarefas
              const costs = calculateCosts(allTasks);
              
              // Verificar se precisamos atualizar o projeto se os valores calculados forem diferentes
              const shouldUpdate = 
                (Math.abs(project.total_hours - costs.totalHours) > 0.01) || 
                (Math.abs(project.total_cost - costs.totalCost) > 0.01);
              
              // Se os valores calculados forem diferentes, atualizar o projeto no banco
              if (shouldUpdate && allTasks.length > 0) {
                console.log(`Atualizando projeto ${project.id} com novos valores calculados:`, {
                  horas: costs.totalHours.toFixed(2),
                  custo: costs.totalCost.toFixed(2)
                });
                
                try {
                  await supabase
                    .from('projects')
                    .update({
                      total_hours: costs.totalHours,
                      total_cost: costs.totalCost,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', project.id);
                } catch (updateError) {
                  console.error(`Erro ao atualizar totais do projeto ${project.id}:`, updateError);
                }
              }

              return {
                ...project,
                tasks: allTasks,
                total_hours: costs.totalHours, // Usar valores recalculados
                total_cost: costs.totalCost,   // Usar valores recalculados
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
};
