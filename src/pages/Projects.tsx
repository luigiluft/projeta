import { useState } from "react";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { ProjectList } from "@/components/Projects/ProjectList";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  attributes: {
    [key: string]: string | number;
  };
}

interface Attribute {
  id: string;
  name: string;
  unit: "hours" | "quantity" | "percentage";
  type: "number" | "list" | "text";
  defaultValue?: string;
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface View {
  id: string;
  name: string;
  columns: string[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [attributes] = useState<Attribute[]>([
    {
      id: "hours",
      name: "Horas Estimadas",
      unit: "hours",
      type: "number",
      defaultValue: "0",
    },
    {
      id: "team",
      name: "Equipe",
      unit: "quantity",
      type: "text",
      defaultValue: "",
    },
  ]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    ...attributes.map(attr => ({
      id: attr.id,
      label: attr.name,
      visible: true,
    })),
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const handleSubmit = (values: any) => {
    if (editingId) {
      setProjects(projects.map(project =>
        project.id === editingId
          ? {
              ...project,
              name: values.name,
              attributes: Object.fromEntries(
                attributes.map(attr => [attr.id, values[attr.id]])
              ),
            }
          : project
      ));
      setEditingId(null);
    } else {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: values.name,
        attributes: Object.fromEntries(
          attributes.map(attr => [attr.id, values[attr.id]])
        ),
      };
      setProjects([...projects, newProject]);
    }
    setShowForm(false);
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
    toast.success("Projeto removido com sucesso!");
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    const newView = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: columns.filter(col => col.visible).map(col => col.id),
    };
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(columns.map(col => ({
      ...col,
      visible: view.columns.includes(col.id),
    })));
  };

  const handleNewProject = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleImportSpreadsheet = () => {
    // Implement spreadsheet import logic here
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
          onNewAttribute={handleNewProject}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Adicionar Projeto"
        />
      </div>

      {showForm && (
        <ProjectForm
          editingId={editingId}
          attributes={attributes}
          onSubmit={handleSubmit}
          initialValues={projects.find(p => p.id === editingId)}
        />
      )}

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
