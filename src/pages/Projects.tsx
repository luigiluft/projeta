import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { ProjectList } from "@/components/Projects/ProjectList";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
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
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestão de Projetos</h1>
              <ActionButtons
                columns={columns}
                savedViews={savedViews}
                onColumnVisibilityChange={handleColumnVisibilityChange}
                onSaveView={handleSaveView}
                onLoadView={handleLoadView}
                onNewAttribute={handleNewProject}
                onImportSpreadsheet={handleImportSpreadsheet}
                newButtonText="Cadastrar Projeto"
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

            <ProjectList
              projects={projects}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </main>
      </div>
    </div>
  );
}