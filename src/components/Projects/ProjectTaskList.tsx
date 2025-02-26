
import { Task } from "@/types/project";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar } from "lucide-react";

interface ProjectTaskListProps {
  tasks: Task[];
}

export function ProjectTaskList({ tasks }: ProjectTaskListProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarefa</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Fase</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Data Início</TableHead>
          <TableHead>Data Fim</TableHead>
          <TableHead className="text-right">Horas</TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
