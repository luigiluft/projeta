import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  attributes: {
    [key: string]: string | number;
  };
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface ProjectListProps {
  projects: Project[];
  columns: Column[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectList({ projects, columns, onEdit, onDelete }: ProjectListProps) {
  const visibleColumns = columns.filter(col => col.visible);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Projetos Cadastrados</h2>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead key={column.id}>{column.label}</TableHead>
                ))}
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  {visibleColumns.map((column) => (
                    <TableCell key={`${project.id}-${column.id}`}>
                      {column.id === "name" ? project.name : project.attributes[column.id]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(project)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="text-center py-4 text-gray-500">
                    Nenhum projeto cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}