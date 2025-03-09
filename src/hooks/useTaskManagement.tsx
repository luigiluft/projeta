import { useState } from "react";
import { Column, Task, View } from "@/types/project";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportToCSV } from "@/utils/csvExport";

export function useTaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  
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
    { id: "actions", label: "Ações", visible: true },
  ]);
  
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const { 
    data: tasks = [], 
    isLoading: loading, 
    error, 
    refetch
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      console.log('Buscando tarefas do banco de dados...');
      const { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Erro ao carregar tarefas');
        throw error;
      }

      console.log('Tasks loaded successfully:', data);
      const transformedTasks: Task[] = data.map((task, index) => ({
        ...task,
        order_number: index + 1,
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

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created_at'>) => {
      // Já que hours_type é opcional na interface Task, vamos usar um valor padrão quando não estiver presente
      const taskWithHoursType = {
        ...newTask,
        hours_type: newTask.hours_type || 'formula'
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

  const handleNewTask = () => {
    setShowForm(true);
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      );
      
      const actionsColumn = updatedColumns.find(col => col.id === "actions");
      if (actionsColumn && !actionsColumn.visible) {
        actionsColumn.visible = true;
      }
      
      console.log("Column visibility changed for:", columnId, "New state:", updatedColumns.find(c => c.id === columnId)?.visible);
      return updatedColumns;
    });
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

  const refreshTasks = () => {
    console.log('Refreshing tasks...');
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const exportTasks = () => {
    if (tasks && tasks.length > 0) {
      const visibleColumns = columns.filter(col => col.visible && col.id !== 'actions');
      
      const formattedData = tasks.map(task => {
        const rowData: Record<string, any> = {};
        visibleColumns.forEach(col => {
          if (col.id in task) {
            if (col.id === 'created_at' && task[col.id]) {
              const date = new Date(task[col.id] as string);
              rowData[col.label] = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
            } else if (col.id === 'is_active') {
              rowData[col.label] = task[col.id] ? 'Sim' : 'Não';
            } else if (col.id === 'status') {
              const statusMap: Record<string, string> = {
                "pending": "Pendente",
                "in_progress": "Em Progresso",
                "completed": "Concluído"
              };
              rowData[col.label] = statusMap[task[col.id] as string] || task[col.id];
            } else {
              rowData[col.label] = task[col.id as keyof Task];
            }
          }
        });
        return rowData;
      });
      
      console.log('Exporting data:', formattedData);
      exportToCSV(formattedData, 'tarefas');
      toast.success('Tarefas exportadas com sucesso!');
    } else {
      toast.error('Não há tarefas para exportar');
    }
  };

  return {
    showForm,
    tasks,
    columns,
    savedViews,
    loading,
    error,
    deleteTasks,
    handleNewTask,
    handleColumnVisibilityChange,
    handleColumnsChange,
    handleSaveView,
    handleLoadView,
    handleTaskSubmit,
    setShowForm,
    exportTasks,
    refreshTasks,
  };
}
