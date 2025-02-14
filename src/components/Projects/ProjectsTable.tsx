
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Project } from "@/types/project";
import { ProjectRow } from "./ProjectRow";
import { ProjectTasksTable } from "./ProjectTasksTable";

interface ProjectsTableProps {
  projects: Project[];
  expandedProject: string | null;
  onToggleProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  formatCurrency: (value: number) => string;
}

export function ProjectsTable({
  projects,
  expandedProject,
  onToggleProject,
  onEditProject,
  onDeleteProject,
  formatCurrency,
}: ProjectsTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Nome do Projeto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Horas</TableHead>
            <TableHead className="text-right">Custo Total</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <>
              <ProjectRow
                key={project.id}
                project={project}
                isExpanded={expandedProject === project.id}
                onToggle={() => onToggleProject(project.id)}
                onEdit={() => onEditProject(project.id)}
                onDelete={() => onDeleteProject(project.id)}
                formatCurrency={formatCurrency}
              />
              {expandedProject === project.id && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <ProjectTasksTable tasks={project.tasks} />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}

          {projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                Nenhum projeto cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
