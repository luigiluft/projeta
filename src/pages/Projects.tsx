
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Task, Column, View } from "@/types/project";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProjectsTable } from "@/components/Projects/ProjectsTable";
import { DeleteProjectDialog } from "@/components/Projects/DeleteProjectDialog";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { Download, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { exportToCSV } from "@/utils/csvExport";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Projects() {
  const {
    projects,
    handleSubmit,
    handleDelete,
    isError,
  } = useProjects();

  const [importDialogOpen, setImportDialogOpen] = useState(false);
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
      setImportDialogOpen(false);
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
  
  const handleExportCSV = () => {
    exportToCSV(projects, "projetos");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={() => navigate('/projects/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Projeto
          </Button>
          <ActionButtons
            columns={columns}
            savedViews={savedViews}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onSaveView={handleSaveView}
            onLoadView={handleLoadView}
            onImportSpreadsheet={() => setImportDialogOpen(true)}
            data={projects}
            exportFilename="projetos"
            showExportButton={false}
            showAddButton={false}
            newButtonText="Adicionar Projeto"
          />
        </div>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar projetos</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao carregar os projetos. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      )}

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

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Importar Projetos</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo CSV ou Excel</Label>
              <Input id="file" type="file" accept=".csv,.xlsx,.xls" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Adicione informações sobre os dados importados" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="headers" />
              <Label htmlFor="headers">A primeira linha contém cabeçalhos</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Importar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
