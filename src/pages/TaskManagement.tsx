import { useState } from "react";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";

export default function TaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const [columns, setColumns] = useState([]);
  const [savedViews, setSavedViews] = useState([]);

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  const handleNewTask = () => {
    setShowForm(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
        <ActionButtons
          columns={columns}
          savedViews={savedViews}
          onNewAttribute={handleNewTask}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Nova Tarefa"
        />
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskList />
          </div>
        </div>
      )}
    </div>
  );
}