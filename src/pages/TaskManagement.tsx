import { useState } from "react";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { TaskHeader } from "@/components/TaskManagement/TaskHeader";
import { Column, Task, View } from "@/types/project";
import { toast } from "sonner";

export default function TaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "description", label: "Descrição", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "priority", label: "Prioridade", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "timeMin", label: "Tempo Mínimo", visible: true },
    { id: "timeMed", label: "Tempo Médio", visible: true },
    { id: "timeMax", label: "Tempo Máximo", visible: true },
    { id: "dependencies", label: "Dependências", visible: true },
    { id: "responsible", label: "Responsável", visible: true },
    { id: "timeFormula", label: "Fórmula de Tempo", visible: true },
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

  const handleTaskSubmit = (values: any) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...values
    };
    setTasks([...tasks, newTask]);
    setShowForm(false);
    toast.success("Tarefa criada com sucesso!");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <TaskHeader
        columns={columns}
        savedViews={savedViews}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onSaveView={handleSaveView}
        onLoadView={handleLoadView}
        onImportSpreadsheet={handleImportSpreadsheet}
        onNewTask={handleNewTask}
        tasks={tasks}
      />

      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskForm 
              onSubmit={handleTaskSubmit}
              open={showForm}
              onOpenChange={setShowForm}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskList 
              tasks={tasks} 
              columns={columns}
              onColumnsChange={handleColumnsChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}