
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Task, Column, View } from "@/types/project";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProjectHeader } from "@/components/Projects/ProjectHeader";
import { ProjectsTable } from "@/components/Projects/ProjectsTable";
import { DeleteProjectDialog } from "@/components/Projects/DeleteProjectDialog";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";

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
  
  // State for columns visibility
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome do Projeto", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "progress", label: "Progresso", visible: true },
    { id: "total_hours", label: "Horas", visible: true },
    { id: "total_cost", label: "Custo Total", visible: true },
    { id: "actions", label: "Ações", visible: true },
  ]);
  
  // State for saved views
  const [savedViews, setSavedViews] = useState<View[]>([]);

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
  
  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      );
      
      // Always keep the "actions" column visible
      const actionsColumn = updatedColumns.find(col => col.id === "actions");
      if (actionsColumn && !actionsColumn.visible) {
        actionsColumn.visible = true;
      }
      
      console.log("Column visibility changed for:", columnId, "New state:", updatedColumns.find(c => c.id === columnId)?.visible);
      return updatedColumns;
    });
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    
    const newView: View = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: [...columns],
    };
    
    setSavedViews(prev => [...prev, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(prev => 
      prev.map(col => {
        const viewCol = view.columns.find(vc => vc.id === col.id);
        return viewCol ? { ...col, visible: viewCol.visible } : col;
      })
    );
    toast.success(`Visualização "${view.name}" carregada`);
  };

  const handleColumnsChange = (newColumns: Column[]) => {
    setColumns(newColumns);
  };
  
  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <ActionButtons
          columns={columns}
          savedViews={savedViews}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Adicionar Projeto"
          data={projects}
          exportFilename="projetos"
          onNewClick={() => navigate('/projects/new')}
        />
      </div>

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
        columns={columns}
        onColumnsChange={handleColumnsChange}
      />

      <DeleteProjectDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
