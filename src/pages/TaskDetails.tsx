
import { useNavigate, useParams } from "react-router-dom";
import { Task } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BasicInfoForm } from "@/components/TaskDetails/BasicInfoForm";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log('TaskDetails rendered with ID:', id);

  if (!id) {
    console.error('No task ID provided');
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/task-management")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">ID da tarefa não fornecido</h1>
        </div>
      </div>
    );
  }

  const { data: task, isLoading: isLoadingTask, error: taskError } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      console.log('Fetching task with ID:', id);
      if (!id) throw new Error('Task ID is required');

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (taskError) {
        console.error('Error fetching task:', taskError);
        throw taskError;
      }
      
      if (!taskData) {
        throw new Error('Task not found');
      }
      
      console.log('Raw task data from Supabase:', taskData);

      // Transformar os dados do Supabase para corresponder à interface Task
      const transformedTask: Task = {
        id: taskData.id,
        order_number: 0, // Valor padrão
        is_active: taskData.is_active !== undefined ? taskData.is_active : true,
        phase: taskData.phase || '',
        epic: taskData.epic || '',
        story: taskData.story || '',
        task_name: taskData.task_name || '',
        hours_formula: taskData.hours_formula,
        fixed_hours: taskData.fixed_hours,
        hours_type: taskData.hours_type || 'formula',
        owner: taskData.owner || '',
        created_at: taskData.created_at,
        // Garantir que status seja um dos valores esperados
        status: (taskData.status === 'pending' || taskData.status === 'in_progress' || taskData.status === 'completed') 
          ? taskData.status as 'pending' | 'in_progress' | 'completed'
          : 'pending',
        start_date: undefined, // Estes campos não existem no banco de dados atual
        end_date: undefined,
        estimated_completion_date: undefined,
        depends_on: taskData.depends_on,
        order: taskData.order
      };

      console.log('Transformed task data:', transformedTask);
      return transformedTask;
    },
    enabled: Boolean(id),
  });

  const { data: projectAttributes } = useQuery({
    queryKey: ['project-attributes'],
    queryFn: async () => {
      console.log('Fetching project attributes');
      const { data, error } = await supabase
        .from('project_attributes')
        .select('name, code, unit, description, default_value');

      if (error) {
        console.error('Error fetching project attributes:', error);
        throw error;
      }

      const formattedAttributes = data?.reduce((acc: Record<string, any>, attr) => {
        // Certifique-se de que o valor é um número se for possível converter
        let defaultValue: string | number = attr.default_value || '';
        
        // Se o valor tiver uma vírgula, substitua por ponto para converter corretamente para número
        if (typeof defaultValue === 'string' && defaultValue.includes(',')) {
          defaultValue = defaultValue.replace(',', '.');
        }
        
        // Tente converter para número se possível
        const numValue = Number(defaultValue);
        acc[attr.code || attr.name] = !isNaN(numValue) ? numValue : defaultValue;
        return acc;
      }, {});

      console.log('Formatted project attributes:', formattedAttributes);
      return formattedAttributes || {};
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (values: Task) => {
      console.log('Updating task with values:', values);
      if (!id) throw new Error('Task ID is required');

      // Remover campos não necessários para a atualização
      const { 
        is_new, 
        is_modified,
        created_at,
        id: taskId,
        start_date,
        end_date,
        estimated_completion_date,
        order_number,
        ...taskData 
      } = values;

      console.log('Filtered task data for update:', taskData);

      // Garantir que o hours_formula está sendo enviado exatamente como está no formulário
      const taskDataToUpdate = {
        ...taskData,
        hours_formula: values.hours_formula // Certifica-se de que a fórmula é enviada como está
      };

      console.log('Final data being sent to Supabase:', taskDataToUpdate);

      const { data, error } = await supabase
        .from('tasks')
        .update(taskDataToUpdate)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      console.log('Supabase update response:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidar também a lista de tarefas
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  });

  if (isLoadingTask) {
    return <div className="container mx-auto py-6">Carregando...</div>;
  }

  if (taskError) {
    console.error('Task error:', taskError);
    return <div className="container mx-auto py-6">Erro ao carregar dados da tarefa</div>;
  }

  if (!task) {
    return <div className="container mx-auto py-6">Tarefa não encontrada</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/task-management")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Tarefa</h1>
      </div>

      <div className="space-y-6">
        <BasicInfoForm 
          task={task} 
          onSubmit={(values) => updateTaskMutation.mutate(values)}
          projectAttributes={projectAttributes || {}}
        />
      </div>
    </div>
  );
}
