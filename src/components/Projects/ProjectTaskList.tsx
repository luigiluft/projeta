
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectTaskListProps {
  tasks: Task[];
  projectId: string;
}

export function ProjectTaskList({ tasks, projectId }: ProjectTaskListProps) {
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const { error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', task.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Tarefa atualizada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar tarefa');
    },
  });

  const handleStatusChange = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskMutation.mutate({ ...task, status: newStatus });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarefa</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>{task.task_name}</TableCell>
            <TableCell>
              <Badge 
                variant={task.status === 'completed' ? 'default' : 'secondary'}
              >
                {task.status}
              </Badge>
            </TableCell>
            <TableCell>{task.hours}</TableCell>
            <TableCell>{task.owner}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange(task)}
              >
                {task.status === 'completed' ? 'Reabrir' : 'Concluir'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
