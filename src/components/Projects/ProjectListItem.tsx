
import { TableCell, TableRow } from "@/components/ui/table";
import { Project } from "@/types/project";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { ProjectTaskList } from "./ProjectTaskList";

interface ProjectListItemProps {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectListItem({
  project,
  isExpanded,
  onToggle,
  onEdit,
  onDelete
}: ProjectListItemProps) {
  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getEstimatedDate = (project: Project) => {
    if (project.due_date) {
      return format(new Date(project.due_date), "dd/MM/yyyy", { locale: ptBR });
    }
    const today = new Date();
    const estimatedDays = Math.ceil(project.total_hours / 8);
    const estimatedDate = new Date(today.setDate(today.getDate() + estimatedDays));
    return format(estimatedDate, "dd/MM/yyyy", { locale: ptBR });
  };

  const getAverageHourlyRate = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    if (project.total_hours === 0) return 0;
    return project.base_cost / project.total_hours;
  };

  return (
    <>
      <TableRow className="group hover:bg-muted/30 transition-colors">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium">
          <div className="space-y-1">
            <div>{project.project_name}</div>
            <div className="text-sm text-muted-foreground">{project.epic}</div>
          </div>
        </TableCell>
        <TableCell>
          <Badge 
            variant="outline" 
            className="bg-primary/10 text-primary border-primary/20"
          >
            {project.epic}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {project.type}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          {formatHours(project.total_hours)}h
        </TableCell>
        <TableCell className="text-right font-medium">
          {formatCurrency(project.total_cost)}
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(getAverageHourlyRate(project))}/h
        </TableCell>
        <TableCell className="text-right">
          {getEstimatedDate(project)}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              title="Editar projeto"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={9} className="p-0">
            <ProjectTaskList project={project} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
