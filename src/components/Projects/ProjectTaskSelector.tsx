
import { useState, useEffect } from "react";
import { Task } from "@/types/project";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectTaskSelectorProps {
  onTasksSelected: (tasks: Task[]) => void;
}

export function ProjectTaskSelector({ onTasksSelected }: ProjectTaskSelectorProps) {
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [totalHours, setTotalHours] = useState(0);

  const { data: tasks = [] } = useQuery({
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

  useEffect(() => {
    const total = selectedTasks.reduce((sum, task) => sum + (task.hours || 0), 0);
    setTotalHours(total);
    onTasksSelected(selectedTasks);
  }, [selectedTasks, onTasksSelected]);

  const handleTaskToggle = (task: Task) => {
    setSelectedTasks(current => {
      const isSelected = current.find(t => t.id === task.id);
      if (isSelected) {
        return current.filter(t => t.id !== task.id);
      }
      return [...current, task];
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Selecione as Tarefas</h3>
        <div className="text-sm text-gray-600">
          Total de Horas: {totalHours}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Selecionar</TableHead>
            <TableHead>Nome da Tarefa</TableHead>
            <TableHead>Fase</TableHead>
            <TableHead>Epic</TableHead>
            <TableHead>Story</TableHead>
            <TableHead>Horas</TableHead>
            <TableHead>Responsável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTasks.some(t => t.id === task.id)}
                  onCheckedChange={() => handleTaskToggle(task)}
                />
              </TableCell>
              <TableCell>{task.task_name}</TableCell>
              <TableCell>{task.phase}</TableCell>
              <TableCell>{task.epic}</TableCell>
              <TableCell>{task.story}</TableCell>
              <TableCell>{task.hours}</TableCell>
              <TableCell>{task.owner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
