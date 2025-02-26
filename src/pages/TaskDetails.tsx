import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Task } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

  // Buscar detalhes da tarefa
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Buscar dependências da tarefa
  const { data: dependencies = [], isLoading: isLoadingDeps } = useQuery({
    queryKey: ['task-dependencies', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select(`
          depends_on,
          dependency:tasks!task_dependencies_depends_on_fkey(
            id,
            task_name,
            status,
            start_date,
            end_date
          )
        `)
        .eq('task_id', taskId);

      if (error) throw error;
      return data || [];
    },
  });

  // Buscar tarefas disponíveis para dependência
  const { data: availableTasks = [] } = useQuery({
    queryKey: ['available-tasks', taskId],
    enabled: !!task?.project_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, task_name, status')
        .eq('project_id', task?.project_id)
        .neq('id', taskId)
        .order('task_name');

      if (error) throw error;
      return data || [];
    },
  });

  const updateDependencyMutation = useMutation({
    mutationFn: async ({ dependsOn }: { dependsOn: string }) => {
      // Primeiro remove dependências existentes
      const { error: deleteError } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('task_id', taskId);

      if (deleteError) throw deleteError;

      // Adiciona nova dependência
      const { error } = await supabase
        .from('task_dependencies')
        .insert({ 
          task_id: taskId, 
          depends_on: dependsOn 
        });

      if (error) {
        if (error.message.includes('Circular dependency')) {
          throw new Error('Não é possível criar uma dependência circular');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      toast.success("Dependência atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    defaultValues: {
      task_name: "",
      phase: "",
      epic: "",
      story: "",
      owner: "",
      hours: 0,
      actual_hours: 0,
      status: "pending",
      start_date: "",
      end_date: "",
      estimated_completion_date: "",
    },
  });

  useEffect(() => {
    if (task) {
      const formattedStartDate = task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '';
      const formattedEndDate = task.end_date ? new Date(task.end_date).toISOString().split('T')[0] : '';
      const formattedEstimatedDate = task.estimated_completion_date ? new Date(task.estimated_completion_date).toISOString().split('T')[0] : '';

      form.reset({
        task_name: task.task_name || "",
        phase: task.phase || "",
        epic: task.epic || "",
        story: task.story || "",
        owner: task.owner || "",
        hours: task.hours || 0,
        actual_hours: task.actual_hours || 0,
        status: task.status || "pending",
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        estimated_completion_date: formattedEstimatedDate,
      });
    }
  }, [task]);

  const updateTaskMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('tasks')
        .update(values)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'] });
      toast.success("Tarefa atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar tarefa");
      console.error(error);
    },
  });

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium">Tarefa não encontrada</h2>
          <Button variant="link" onClick={() => navigate('/task-management')}>
            Voltar para lista de tarefas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 mb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/task-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Tarefa</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário da Tarefa */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(values => updateTaskMutation.mutate(values))}>
            <Card>
              <CardHeader>
                <FormField
                  control={form.control}
                  name="task_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="text-xl font-semibold"
                          placeholder="Nome da tarefa"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-500">Informações Básicas</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="phase"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fase</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Fase do projeto" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="epic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Epic</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Epic" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="story"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Story</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Story" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="owner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nome do responsável" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-500">Status e Progresso</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Status da tarefa" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horas Estimadas</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" placeholder="0" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="actual_hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horas Realizadas</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" placeholder="0" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-500">Datas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Término</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estimated_completion_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previsão de Conclusão</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 flex justify-end">
              <Button type="submit" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </form>
        </Form>

        {/* Gerenciamento de Dependências */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Dependências</h2>
            </CardHeader>
            <CardContent>
              {isLoadingDeps ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Adicionar Dependência
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tarefa</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableTasks.map((availableTask) => (
                          <TableRow key={availableTask.id}>
                            <TableCell>{availableTask.task_name}</TableCell>
                            <TableCell>
                              <Badge variant={availableTask.status === 'completed' ? 'default' : 'secondary'}>
                                {availableTask.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateDependencyMutation.mutate({ dependsOn: availableTask.id })}
                              >
                                Adicionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Dependências Atuais
                    </h3>
                    {dependencies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Esta tarefa não possui dependências
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dependencies.map((dep) => (
                          <div
                            key={dep.depends_on}
                            className="flex items-center justify-between p-2 rounded-lg border"
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleTask(dep.depends_on)}
                                className="p-1 hover:bg-accent rounded"
                              >
                                {expandedTasks.includes(dep.depends_on) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <span>{dep.dependency.task_name}</span>
                              <Badge variant={dep.dependency.status === 'completed' ? 'default' : 'secondary'}>
                                {dep.dependency.status}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                const { error } = supabase
                                  .from('task_dependencies')
                                  .delete()
                                  .eq('task_id', taskId)
                                  .eq('depends_on', dep.depends_on);

                                if (error) {
                                  toast.error("Erro ao remover dependência");
                                  return;
                                }

                                queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
                                toast.success("Dependência removida com sucesso");
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
