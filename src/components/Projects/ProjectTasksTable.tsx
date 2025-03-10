
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Calendar } from "lucide-react";
import { Task } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

interface ProjectTasksTableProps {
  tasks?: Task[];
  projectId: string;
  epic: string;
}

export function ProjectTasksTable({ tasks = [], projectId, epic }: ProjectTasksTableProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      // Primeiro, criar a tarefa na tabela tasks
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          ...values,
          epic,
          is_active: true,
          status: 'pending',
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      if (taskData) {
        // Depois, relacionar a tarefa ao projeto na tabela project_tasks
        const { error: projectTaskError } = await supabase
          .from('project_tasks')
          .insert([{
            project_id: projectId,
            task_id: taskData.id,
            status: 'pending',
            is_active: true,
            calculated_hours: values.fixed_hours || 0,
            owner_id: user?.email // Usando email como owner_id já que agora é TEXT
          }]);

        if (projectTaskError) throw projectTaskError;
      }

      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      toast.success('Tarefa criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200",
    };

    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const getHoursFromFormula = (formula: string | undefined) => {
    if (!formula) return 0;
    const hours = parseFloat(formula);
    return isNaN(hours) ? 0 : hours;
  };

  return (
    <div className="bg-muted/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Tarefas do Projeto</h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-3 w-3 mr-2" />
              Adicionar Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <TaskForm onSubmit={handleSubmit} open={open} onOpenChange={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarefa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fase</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data Início</TableHead>
            <TableHead>Data Fim</TableHead>
            <TableHead className="text-right">Horas Prev.</TableHead>
            <TableHead className="text-right">Horas Real.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <div className="space-y-1">
                  <div>{task.task_name}</div>
                  <div className="text-sm text-muted-foreground">{task.story}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs ${getStatusBadge(task.status)}`}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {task.phase}
                </Badge>
              </TableCell>
              <TableCell>{task.owner}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {formatDate(task.start_date)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {formatDate(task.end_date)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {getHoursFromFormula(task.hours_formula)}h
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {getHoursFromFormula(task.hours_formula)}h
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
