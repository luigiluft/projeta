
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Project } from "@/types/project";

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
          {project.name}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {project.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {project.type}
        </Badge>
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
