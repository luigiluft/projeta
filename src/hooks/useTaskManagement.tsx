
import { useState } from "react";
import { Column, Task, View } from "@/types/project";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useTaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<Column[]>([
    { id: "task_name", label: "Tarefa", visible: true },
    { id: "phase", label: "Fase", visible: true },
    { id: "epic", label: "Epic", visible: true },
    { id: "story", label: "Story", visible: true },
    { id: "hours", label: "Horas", visible: true },
    { id: "owner", label: "Responsável", visible: true },
    { id: "dependency", label: "Dependência", visible: true },
    { id: "created_at", label: "Criado em", visible: true },
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      // Removendo o order_number.asc que estava causando erro
      const { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Erro ao carregar tarefas');
        throw error;
      }

      console.log('Tasks loaded successfully:', data);
      return data as Task[];
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Tarefa criada com sucesso!");
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  const handleNewTask = () => {
    setShowForm(true);
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleColumnsChange = (newColumns: Column[]) => {
    setColumns(newColumns);
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    const newView: View = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: columns,
    };
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(view.columns);
    toast.success("Visualização carregada com sucesso");
  };

  const handleTaskSubmit = (values: Omit<Task, "id" | "created_at">) => {
    createTaskMutation.mutate(values);
  };

  return {
    showForm,
    tasks,
    columns,
    savedViews,
    handleImportSpreadsheet,
    handleNewTask,
    handleColumnVisibilityChange,
    handleColumnsChange,
    handleSaveView,
    handleLoadView,
    handleTaskSubmit,
    setShowForm,
  };
}
