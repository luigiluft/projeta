import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { ProjectList } from "@/components/Projects/ProjectList";
import { PROJECT_ATTRIBUTES } from "@/constants/projectAttributes";
import { useProjects } from "@/hooks/useProjects";
import { Column, View } from "@/types/project";

export default function Projects() {
  const navigate = useNavigate();
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
    { id: "name", label: "Nome", visible: true },
    ...PROJECT_ATTRIBUTES.map(attr => ({
      id: attr.id,
      label: attr.name,
      visible: true,
    })),
  ]);

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleLoadView = (view: View) => {
    setColumns(columns.map(col => ({
      ...col,
      visible: view.columns.includes(col.id),
    })));
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