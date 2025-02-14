
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
import { Check, Clock } from "lucide-react";

interface ProjectTaskSelectorProps {
  onTasksSelected: (tasks: Task[]) => void;
}

export function ProjectTaskSelector({ onTasksSelected }: ProjectTaskSelectorProps) {
  const [selectedEpic, setSelectedEpic] = useState<string>("");
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

  const epics = [...new Set(tasks.map(task => task.epic))];
  const filteredTasks = tasks.filter(task => task.epic === selectedEpic);

  useEffect(() => {
    const total = filteredTasks.reduce((sum, task) => sum + (task.hours || 0), 0);
    setTotalHours(total);
    onTasksSelected(filteredTasks);
  }, [selectedEpic, filteredTasks, onTasksSelected]);

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
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Tarefa</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Story</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.task_name}</TableCell>
                  <TableCell>{task.phase}</TableCell>
                  <TableCell>{task.story}</TableCell>
                  <TableCell className="text-right">{task.hours}h</TableCell>
                  <TableCell>{task.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
