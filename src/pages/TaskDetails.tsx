
import { useNavigate, useParams } from "react-router-dom";
import { Task } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BasicInfoForm } from "@/components/TaskDetails/BasicInfoForm";
import { DependenciesList } from "@/components/TaskDetails/DependenciesList";

export default function TaskDetails() {
  const { id: taskId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log('TaskDetails rendered with ID:', taskId);

  const { data: task, isLoading: isLoadingTask, error: taskError } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      console.log('Fetching task with ID:', taskId);
      if (!taskId) throw new Error('Task ID is required');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching task:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Task not found');
      }

      console.log('Task data:', data);
      return data as Task;
    },
    enabled: Boolean(taskId),
  });

  const { data: dependencies = [], isLoading: isLoadingDeps, error: depsError } = useQuery({
    queryKey: ['task-dependencies', taskId],
    queryFn: async () => {
      console.log('Fetching dependencies for task:', taskId);
      if (!taskId) throw new Error('Task ID is required');

      const { data, error } = await supabase
        .from('task_dependencies')
        .select(`
          id,
          task_id,
          depends_on,
          created_at,
          tasks!task_dependencies_depends_on_fkey(*)
        `)
        .eq('task_id', taskId);

      if (error) {
        console.error('Error fetching dependencies:', error);
        throw error;
      }

      console.log('Dependencies data:', data);
      return data.map(dep => ({
        id: dep.id,
        task_id: dep.task_id,
        depends_on: dep.depends_on,
        created_at: dep.created_at,
        dependency: dep.tasks ? {
          ...dep.tasks,
          is_active: dep.tasks.is_active ?? true,
          order_number: dep.tasks.order_number ?? 0,
          actual_hours: dep.tasks.actual_hours ?? 0,
        } : undefined,
      }));
    },
    enabled: Boolean(taskId),
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (values: Task) => {
      console.log('Updating task with values:', values);
      if (!taskId) throw new Error('Task ID is required');

      const { error } = await supabase
        .from('tasks')
        .update(values)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  });

  const addDependencyMutation = useMutation({
    mutationFn: async (dependsOn: string) => {
      if (!taskId) throw new Error('Task ID is required');

      const { error } = await supabase
        .from('task_dependencies')
        .insert({
          task_id: taskId,
          depends_on: dependsOn,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', taskId] });
      toast.success('Dependência adicionada com sucesso!');
    },
    onError: (error) => {
      console.error('Error adding dependency:', error);
      toast.error('Erro ao adicionar dependência');
    }
  });

  const removeDependencyMutation = useMutation({
    mutationFn: async (dependencyId: string) => {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', taskId] });
      toast.success('Dependência removida com sucesso!');
    },
    onError: (error) => {
      console.error('Error removing dependency:', error);
      toast.error('Erro ao remover dependência');
    }
  });

  const handleAddDependency = async () => {
    if (!taskId) return;

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, task_name')
      .neq('id', taskId);

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

    addDependencyMutation.mutate(dependsOn);
  };

  if (!taskId) {
    console.error('No task ID provided');
    return <div className="container mx-auto py-6">ID da tarefa não fornecido</div>;
  }

  if (isLoadingTask || isLoadingDeps) {
    return <div className="container mx-auto py-6">Carregando...</div>;
  }

  if (taskError) {
    console.error('Task error:', taskError);
    return <div className="container mx-auto py-6">Erro ao carregar tarefa</div>;
  }

  if (depsError) {
    console.error('Dependencies error:', depsError);
    return <div className="container mx-auto py-6">Erro ao carregar dependências</div>;
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
        />
        <DependenciesList 
          dependencies={dependencies}
          onAddDependency={handleAddDependency}
          onRemoveDependency={(id) => removeDependencyMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
