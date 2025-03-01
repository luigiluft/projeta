
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Task } from "@/types/project";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProjectHeader } from "@/components/Projects/ProjectHeader";
import { ProjectsTable } from "@/components/Projects/ProjectsTable";
import { DeleteProjectDialog } from "@/components/Projects/DeleteProjectDialog";

export default function Projects() {
  const {
    projects,
    handleSubmit,
    handleDelete,
  } = useProjects();

  const [open, setOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleTasksSelected = async (tasks: Task[], attributeValues: Record<string, number> = {}) => {
    try {
      await handleSubmit(tasks, attributeValues);
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Projeto criado com sucesso");
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast.error("Erro ao criar projeto");
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await handleDelete(projectToDelete);
        setProjectToDelete(null);
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast.success("Projeto excluído com sucesso");
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        toast.error("Erro ao excluir projeto");
      }
    }
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/edit/${projectId}`);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProjectHeader
        open={open}
        setOpen={setOpen}
        onTasksSelected={handleTasksSelected}
      />

      <ProjectsTable
        projects={projects}
        expandedProject={expandedProject}
        onToggleProject={toggleProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleProjectDelete}
        formatCurrency={formatCurrency}
      />

      <DeleteProjectDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
