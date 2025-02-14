
import { useState, useEffect } from "react";
import { Task } from "@/types/project";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, Clock, Edit2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

interface ProjectTaskSelectorProps {
  onTasksSelected: (tasks: Task[]) => void;
}

export function ProjectTaskSelector({ onTasksSelected }: ProjectTaskSelectorProps) {
  const [selectedEpic, setSelectedEpic] = useState<string>("");
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  const form = useForm<Task>();

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order_number', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar tarefas');
        throw error;
      }

      return data as Task[];
    },
  });

  const epics = [...new Set(allTasks.map(task => task.epic))];
  
  useEffect(() => {
    if (selectedEpic) {
      const epicTasks = allTasks.filter(task => task.epic === selectedEpic);
      setSelectedTasks(epicTasks);
    }
  }, [selectedEpic, allTasks]);

  useEffect(() => {
    const total = selectedTasks.reduce((sum, task) => sum + (task.hours || 0), 0);
    setTotalHours(total);
    onTasksSelected(selectedTasks);
  }, [selectedTasks, onTasksSelected]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    form.reset(task);
  };

  const handleSaveTask = (values: Task) => {
    const updatedTasks = selectedTasks.map(task => 
      task.id === values.id ? { ...task, ...values } : task
    );
    setSelectedTasks(updatedTasks);
    setEditingTask(null);
    toast.success("Tarefa atualizada com sucesso!");
  };

  const handleAddExistingTask = (task: Task) => {
    if (!selectedTasks.find(t => t.id === task.id)) {
      setSelectedTasks([...selectedTasks, task]);
      setShowTaskSelector(false);
      toast.success("Tarefa adicionada ao projeto!");
    } else {
      toast.error("Esta tarefa já está no projeto!");
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setSelectedTasks(selectedTasks.filter(task => task.id !== taskId));
    toast.success("Tarefa removida do projeto!");
  };

  const availableTasks = allTasks.filter(task => 
    !selectedTasks.find(t => t.id === task.id)
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Selecione o Epic</h3>
            <p className="text-sm text-gray-500">
              Todas as tarefas associadas serão incluídas automaticamente
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />
            <span>Total de Horas: {totalHours}</span>
          </div>
        </div>

        <Select value={selectedEpic} onValueChange={setSelectedEpic}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um epic" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Epics Disponíveis</SelectLabel>
              {epics.map((epic) => (
                <SelectItem key={epic} value={epic}>
                  {epic}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {selectedEpic && (
        <>
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">Tarefas do Projeto</h4>
            <Dialog open={showTaskSelector} onOpenChange={setShowTaskSelector}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Tarefa Existente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome da Tarefa</TableHead>
                        <TableHead>Epic</TableHead>
                        <TableHead>Horas</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.task_name}</TableCell>
                          <TableCell>{task.epic}</TableCell>
                          <TableCell>{task.hours}h</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddExistingTask(task)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Tarefa</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Story</TableHead>
                  <TableHead className="text-right">Horas</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.task_name}</TableCell>
                    <TableCell>{task.phase}</TableCell>
                    <TableCell>{task.story}</TableCell>
                    <TableCell className="text-right">{task.hours}h</TableCell>
                    <TableCell>{task.owner}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTask(task.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="task_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Tarefa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
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
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingTask(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button className="bg-primary hover:bg-primary/90">
          <Check className="h-4 w-4 mr-2" />
          Criar Projeto
        </Button>
      </div>
    </div>
  );
}
