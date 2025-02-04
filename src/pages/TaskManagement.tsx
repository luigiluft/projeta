import { useState } from "react";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";

interface Task {
  id: string;
  name: string;
  type: "epic" | "story" | "task";
  priority: "low" | "medium" | "high" | "urgent";
  status: "backlog" | "in_progress" | "done";
  responsible: string;
  timeMin: string;
  timeMed: string;
  timeMax: string;
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

export default function TaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "priority", label: "Prioridade", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "responsible", label: "Responsável", visible: true },
    { id: "timeMin", label: "Tempo Mínimo", visible: true },
    { id: "timeMed", label: "Tempo Médio", visible: true },
    { id: "timeMax", label: "Tempo Máximo", visible: true },
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

  const handleSaveView = () => {
    console.log("Save view clicked");
  };

  const handleLoadView = (view: View) => {
    console.log("Load view clicked", view);
  };

  const handleTaskSubmit = (values: any) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...values
    };
    setTasks([...tasks, newTask]);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
        <ActionButtons
          columns={columns}
          savedViews={savedViews}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onNewAttribute={handleNewTask}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Nova Tarefa"
          data={tasks}
          exportFilename="tarefas"
        />
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskForm 
              open={showForm} 
              onOpenChange={setShowForm}
              onSubmit={handleTaskSubmit}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskList tasks={tasks} columns={columns} />
          </div>
        </div>
      )}
    </div>
  );
}