
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Task, TaskDependency } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TaskDetails() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data as Task;
    },
  });

  const { data: dependencies = [] } = useQuery({
    queryKey: ['task-dependencies', taskId],
    queryFn: async () => {
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

      if (error) throw error;
      
      return data.map(dep => ({
        id: dep.id,
        task_id: dep.task_id,
        depends_on: dep.depends_on,
        created_at: dep.created_at,
        dependency: {
          ...dep.tasks,
          is_active: dep.tasks.is_active ?? true,
          order_number: dep.tasks.order_number ?? 0,
          actual_hours: dep.tasks.actual_hours ?? 0,
        }
      })) as TaskDependency[];
    },
  });

  const form = useForm<Task>({
    defaultValues: task,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (values: Task) => {
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
  });

  const addDependencyMutation = useMutation({
    mutationFn: async (dependsOn: string) => {
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
  });

  if (!task) return null;

  const onSubmit = (values: Task) => {
    updateTaskMutation.mutate(values);
  };

  const handleAddDependency = async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, task_name')
      .neq('id', taskId);

    if (!tasks) return;

    // Aqui você pode implementar um modal ou dropdown para selecionar a tarefa
    const dependsOn = window.prompt('ID da tarefa dependente:');
    if (!dependsOn) return;

    addDependencyMutation.mutate(dependsOn);
  };

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
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task_name">Nome da Tarefa</Label>
              <Input id="task_name" {...form.register("task_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase">Fase</Label>
              <Input id="phase" {...form.register("phase")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="epic">Epic</Label>
                <Input id="epic" {...form.register("epic")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story">Story</Label>
                <Input id="story" {...form.register("story")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Horas Estimadas</Label>
                <Input 
                  id="hours" 
                  type="number" 
                  step="0.01"
                  {...form.register("hours", { valueAsNumber: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual_hours">Horas Realizadas</Label>
                <Input 
                  id="actual_hours" 
                  type="number" 
                  step="0.01"
                  {...form.register("actual_hours", { valueAsNumber: true })} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Responsável</Label>
              <Input id="owner" {...form.register("owner")} />
            </div>

            <Button type="submit">Salvar Alterações</Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dependências</h2>
            <Button onClick={handleAddDependency} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {dependencies.length > 0 ? (
            <div className="space-y-2">
              {dependencies.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span>{dep.dependency?.task_name}</span>
                    <Badge>{dep.dependency?.status}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDependencyMutation.mutate(dep.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Esta tarefa não possui dependências</p>
          )}
        </div>
      </div>
    </div>
  );
}
