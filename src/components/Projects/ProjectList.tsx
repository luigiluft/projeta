
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Project } from "@/types/project";
import { useState } from "react";
import { ProjectListHeader } from "./ProjectListHeader";
import { ProjectListItem } from "./ProjectListItem";
import { ProjectDeleteDialog } from "./ProjectDeleteDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProjectListProps {
  projects: Project[];
  onDeleteProject: (projectId: string) => void;
}

export function ProjectList({ projects, onDeleteProject }: ProjectListProps) {
  const navigate = useNavigate();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/edit/${projectId}`);
    toast.success("Editando projeto...", {
      description: "Você será redirecionado para a página de edição"
    });
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await onDeleteProject(projectToDelete);
        setProjectToDelete(null);
        toast.success("Projeto excluído com sucesso");
      } catch (error) {
        toast.error("Erro ao excluir projeto");
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <ProjectListHeader />
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              isExpanded={expandedProjects.includes(project.id)}
              onToggle={() => toggleProject(project.id)}
              onEdit={() => handleEditProject(project.id)}
              onDelete={() => handleDeleteClick(project.id)}
            />
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center text-muted-foreground py-8">
                Nenhum projeto cadastrado
              </td>
            </tr>
          )}
        </TableBody>
      </Table>

      <ProjectDeleteDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
