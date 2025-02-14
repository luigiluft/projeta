
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";

interface ProjectRowProps {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatCurrency: (value: number) => string;
}

export function ProjectRow({
  project,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  formatCurrency,
}: ProjectRowProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={onToggle}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <div className="space-y-1">
            <div>{project.name}</div>
            {project.delay_days > 0 && (
              <div className="text-sm text-red-600">
                Atrasado: {project.delay_days} dias
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusColor(project.status)}>
          {project.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {project.type}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {Math.round(project.progress * 100)}%
          </div>
          <Progress value={project.progress * 100} className="h-2" />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          {project.total_hours.toFixed(1)}h
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          {formatCurrency(project.total_cost)}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
