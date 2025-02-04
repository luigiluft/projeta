import { useState } from "react";
import { Column, Task, View } from "@/types/project";
import { toast } from "sonner";

export function useTaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "itemKey", label: "Chave", visible: true },
    { id: "summary", label: "Resumo", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "priority", label: "Prioridade", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "assignee", label: "Responsável", visible: true },
    { id: "created", label: "Criado em", visible: true },
    { id: "updated", label: "Atualizado em", visible: true },
    { id: "originalEstimate", label: "Estimativa Original", visible: true },
    { id: "totalTimeSpent", label: "Tempo Total Gasto", visible: true },
    { id: "remainingEstimate", label: "Estimativa Restante", visible: true },
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

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

  const handleTaskSubmit = (values: Omit<Task, "id">) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...values
    };
    setTasks([...tasks, newTask]);
    setShowForm(false);
    toast.success("Tarefa criada com sucesso!");
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