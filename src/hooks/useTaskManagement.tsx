
import { useState } from "react";
import { Column, Task, View } from "@/types/project";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useTaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  
  // Definir todas as colunas disponíveis na tabela tasks
  const [columns, setColumns] = useState<Column[]>([
    { id: "id", label: "ID", visible: true },
    { id: "task_name", label: "Tarefa", visible: true },
    { id: "phase", label: "Fase", visible: true },
    { id: "epic", label: "Epic", visible: true },
    { id: "story", label: "Story", visible: true },
    { id: "hours_formula", label: "Fórmula de Horas", visible: true },
    { id: "fixed_hours", label: "Horas Fixas", visible: true },
    { id: "owner", label: "Responsável", visible: true },
    { id: "is_active", label: "Ativo", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "order", label: "Ordem", visible: true },
    { id: "depends_on", label: "Dependência", visible: true },
    { id: "hours_type", label: "Tipo de Horas", visible: true },
    { id: "created_at", label: "Criado em", visible: true },
  ]);
  
  const [savedViews, setSavedViews] = useState<View[]>([]);

  // Fetch tasks
  const { 
    data: tasks = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Erro ao carregar tarefas');
        throw error;
      }

      console.log('Tasks loaded successfully:', data);
      // Transformar os dados para incluir order_number
      const transformedTasks: Task[] = data.map((task, index) => ({
        ...task,
        order_number: index + 1, // Adiciona order_number com base no índice
        phase: task.phase || '',
        epic: task.epic || '',
        story: task.story || '',
        owner: task.owner || '',
        status: (task.status as 'pending' | 'in_progress' | 'completed') || 'pending',
        hours: task.fixed_hours || 0
      }));
      
      return transformedTasks;
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created_at'>) => {
      // Add the required hours_type property for database compatibility
      const taskWithHoursType = {
        ...newTask,
        hours_type: 'formula' // Default value for hours_type
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskWithHoursType])
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

  // Delete tasks mutation
  const deleteTasksMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .in('id', taskIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Tarefas excluídas com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir tarefas: ${error.message}`);
    },
  });

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  const handleNewTask = () => {
    setShowForm(true);
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(prevColumns => prevColumns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
    console.log("Column visibility changed for:", columnId);
  };

  const handleColumnsChange = (newColumns: Column[]) => {
    setColumns(newColumns);
    console.log("Columns updated:", newColumns);
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

  const deleteTasks = (taskIds: string[]) => {
    deleteTasksMutation.mutate(taskIds);
  };

  return {
    showForm,
    tasks,
    columns,
    savedViews,
    loading,
    error,
    deleteTasks,
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
