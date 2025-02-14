
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/types/project";

interface ProjectTasksTableProps {
  tasks?: Task[];
}

export function ProjectTasksTable({ tasks = [] }: ProjectTasksTableProps) {
  return (
    <div className="bg-muted/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Tarefas do Projeto</h4>
        <Button size="sm">
          <Plus className="h-3 w-3 mr-2" />
          Adicionar Tarefa
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarefa</TableHead>
            <TableHead>Fase</TableHead>
            <TableHead>História</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead className="text-right">Horas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.task_name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {task.phase}
                </Badge>
              </TableCell>
              <TableCell>{task.story}</TableCell>
              <TableCell>{task.owner}</TableCell>
              <TableCell className="text-right">{task.hours}h</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
