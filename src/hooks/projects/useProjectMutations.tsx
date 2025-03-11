
import { Project, Task } from "@/types/project";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjectCalculations } from "./useProjectCalculations";

export const useProjectMutations = () => {
  const queryClient = useQueryClient();
  const { calculateProjectCosts } = useProjectCalculations();

  // Função para criar um novo projeto
  const handleSubmit = async (selectedTasks: Task[], attributeValues: Record<string, number> = {}) => {
    if (selectedTasks.length === 0) {
      toast.error("Selecione pelo menos uma tarefa");
      return;
    }

    const epics = Array.from(new Set(selectedTasks.map(task => task.epic))).filter(Boolean);
    const epicNames = epics.join(', ');
    
    const costs = calculateProjectCosts(selectedTasks, attributeValues);
    
    // Separar tarefas de implementação e sustentação
    const implementationTasks = selectedTasks.filter(task => 
      !task.epic.toLowerCase().includes('sustentação') && 
      !task.epic.toLowerCase().includes('sustentacao'));
    
    const sustainmentTasks = selectedTasks.filter(task => 
      task.epic.toLowerCase().includes('sustentação') || 
      task.epic.toLowerCase().includes('sustentacao'));
    
    console.log(`Tarefas de implementação: ${implementationTasks.length}, Tarefas de sustentação: ${sustainmentTasks.length}`);
    
    // Garantir que ticket_medio seja processado corretamente
    console.log("Valores de atributos a serem salvos:", attributeValues);
    
    // Debug para ver se ticket_medio está presente
    if ('ticket_medio' in attributeValues) {
      console.log("Ticket médio recebido:", attributeValues.ticket_medio);
    } else {
      console.log("Ticket médio não encontrado nos valores de atributos");
    }

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
          metadata: { 
            attribute_values: attributeValues,
            implementation_tasks_count: implementationTasks.length,
            sustainment_tasks_count: sustainmentTasks.length
          },
          attributes: attributeValues, // Também salvar os valores em attributes para compatibilidade
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

  // Função para excluir um projeto
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

  return {
    handleSubmit,
    handleDelete
  };
};
