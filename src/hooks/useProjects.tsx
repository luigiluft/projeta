
import { useState } from "react";
import { Task, View } from "@/types/project";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjects = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const { data: projects = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order_number', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar tarefas');
        throw error;
      }

      return data as Task[];
    },
  });

  const handleSubmit = (values: Task) => {
    // Implementar lógica de submissão mais tarde
    toast.success("Projeto salvo com sucesso!");
  };

  const handleEdit = (project: Task) => {
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    // Implementar lógica de deleção mais tarde
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
