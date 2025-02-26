import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, Search } from "lucide-react";
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
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Task } from "@/types/project";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, dependency_task:tasks!tasks_dependency_fkey(id, task_name, status)')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: availableTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['available-tasks', search, task?.project_id],
    enabled: open && !!task?.project_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, task_name, status')
        .eq('project_id', task?.project_id)
        .neq('id', taskId)
        .ilike('task_name', `%${search}%`)
        .order('task_name');

      if (error) throw error;
      return data || [];
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('tasks')
        .update(values)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success("Tarefa atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar tarefa");
      console.error(error);
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
      dependency: "",
      start_date: "",
      end_date: "",
      estimated_completion_date: "",
    },
  });

  useEffect(() => {
    if (task) {
      const formattedStartDate = task.start_date ? format(new Date(task.start_date), 'yyyy-MM-dd') : '';
      const formattedEndDate = task.end_date ? format(new Date(task.end_date), 'yyyy-MM-dd') : '';
      const formattedEstimatedDate = task.estimated_completion_date ? format(new Date(task.estimated_completion_date), 'yyyy-MM-dd') : '';

      form.reset({
        task_name: task.task_name || "",
        phase: task.phase || "",
        epic: task.epic || "",
        story: task.story || "",
        owner: task.owner || "",
        hours: task.hours || 0,
        actual_hours: task.actual_hours || 0,
        status: task.status || "pending",
        dependency: task.dependency || "",
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        estimated_completion_date: formattedEstimatedDate,
      });
    }
  }, [task]);

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

  const onSubmit = (values: any) => {
    if (values.dependency === taskId) {
      toast.error("Uma tarefa não pode depender dela mesma");
      return;
    }
    updateTaskMutation.mutate(values);
  };

  const selectedTask = availableTasks.find(
    (task) => task.id === form.getValues("dependency")
  );

  return (
    <div className="container mx-auto py-6 space-y-6 mb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/task-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Tarefa</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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

              <div className="space-y-4">
                <h3 className="font-medium text-gray-500">Dependências</h3>
                <FormField
                  control={form.control}
                  name="dependency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarefa Dependente</FormLabel>
                      <FormDescription>
                        Esta tarefa só poderá ser iniciada após a conclusão da tarefa selecionada
                      </FormDescription>
                      <FormControl>
                        <Popover 
                          open={open} 
                          onOpenChange={setOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                            >
                              {selectedTask ? (
                                <div className="flex items-center gap-2">
                                  <span>{selectedTask.task_name}</span>
                                  <Badge variant={selectedTask.status === 'completed' ? 'default' : 'secondary'}>
                                    {selectedTask.status}
                                  </Badge>
                                </div>
                              ) : "Selecione uma tarefa dependente..."}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                              <CommandInput 
                                placeholder="Pesquisar tarefas..." 
                                value={search}
                                onValueChange={setSearch}
                              />
                              {isLoadingTasks ? (
                                <div className="p-4 text-center">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </div>
                              ) : availableTasks.length === 0 ? (
                                <CommandEmpty>Nenhuma tarefa encontrada.</CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {availableTasks.map((task) => (
                                    <CommandItem
                                      key={task.id}
                                      onSelect={() => {
                                        field.onChange(task.id);
                                        setOpen(false);
                                      }}
                                      className="flex items-center justify-between"
                                    >
                                      <span>{task.task_name}</span>
                                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                                        {task.status}
                                      </Badge>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </FormItem>
                  )}
                />
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
    </div>
  );
}
