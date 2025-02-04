import { useState } from "react";
import { Project, View, Column, Attribute } from "@/types/project";
import { toast } from "sonner";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const handleSubmit = (values: Project) => {
    if (editingId) {
      setProjects(projects.map(project =>
        project.id === editingId ? values : project
      ));
      setEditingId(null);
    } else {
      setProjects([...projects, values]);
    }
    setShowForm(false);
    toast.success(editingId ? "Projeto atualizado com sucesso!" : "Projeto criado com sucesso!");
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
    toast.success("Projeto removido com sucesso!");
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    const newView = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: [],
    };
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  return {
    projects,
    editingId,
    showForm,
    savedViews,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSaveView,
    setShowForm,
  };
};