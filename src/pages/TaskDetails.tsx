
import { useNavigate, useParams } from "react-router-dom";
import { Task } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BasicInfoForm } from "@/components/TaskDetails/BasicInfoForm";
import { DependenciesList } from "@/components/TaskDetails/DependenciesList";
import { useState } from "react";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSelectingDependency, setIsSelectingDependency] = useState(false);

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

      // Primeiro, busque a tarefa principal
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

      // Se a tarefa tiver uma dependência, busque essa dependência separadamente
      let dependencyTask = null;
      if (taskData.depends_on) {
        const { data: dependencyData, error: dependencyError } = await supabase
          .from('tasks')
          .select('id, task_name')
          .eq('id', taskData.depends_on)
          .single();
          
        if (!dependencyError && dependencyData) {
          dependencyTask = dependencyData;
          console.log('Dependency task found:', dependencyTask);
        } else if (dependencyError) {
          console.error('Error fetching dependency task:', dependencyError);
        }
      }

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
        dependency: dependencyTask ? {
          id: dependencyTask.id,
          task_name: dependencyTask.task_name
        } : undefined
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
        .select('name, value, unit, description, default_value');

      if (error) {
        console.error('Error fetching project attributes:', error);
        throw error;
      }

      const formattedAttributes = data?.reduce((acc: Record<string, any>, attr) => {
        const value = !isNaN(Number(attr.value)) ? Number(attr.value) : attr.value;
        acc[attr.name] = value;
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

      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id);

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  });

  const updateDependencyMutation = useMutation({
    mutationFn: async (dependsOn: string | null) => {
      if (!id) throw new Error('Task ID is required');

      const { error } = await supabase
        .from('tasks')
        .update({ depends_on: dependsOn })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setIsSelectingDependency(false);
      toast.success('Dependência atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating dependency:', error);
      toast.error('Erro ao atualizar dependência');
    }
  });

  const handleAddDependency = async () => {
    if (!id) return;

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, task_name')
      .neq('id', id);

    if (error) {
      console.error('Error fetching tasks for dependency:', error);
      toast.error('Erro ao buscar tarefas');
      return;
    }

    if (!tasks) {
      toast.error('Nenhuma tarefa encontrada');
      return;
    }

    const dependsOn = window.prompt('ID da tarefa dependente:');
    if (!dependsOn) return;

    updateDependencyMutation.mutate(dependsOn);
  };

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
        <DependenciesList 
          taskId={id}
          dependencyTask={task.dependency}
          onAddDependency={handleAddDependency}
          onRemoveDependency={() => updateDependencyMutation.mutate(null)}
        />
      </div>
    </div>
  );
}
