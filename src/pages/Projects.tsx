
import { useState } from "react";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { ProjectList } from "@/components/Projects/ProjectList";
import { useProjects } from "@/hooks/useProjects";
import { Column, View } from "@/types/project";

export default function Projects() {
  const {
    projects,
    editingId,
    showForm,
    savedViews,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSaveView,
  } = useProjects();

  const [columns, setColumns] = useState<Column[]>([
    { id: "task_name", label: "Nome da Tarefa", visible: true },
    { id: "phase", label: "Fase", visible: true },
    { id: "epic", label: "Epic", visible: true },
    { id: "story", label: "Story", visible: true },
    { id: "hours", label: "Horas", visible: true },
    { id: "owner", label: "Responsável", visible: true },
  ]);

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleLoadView = (view: View) => {
    setColumns(view.columns);
  };

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestão de Projetos</h1>
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
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <ProjectList
            projects={projects}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
