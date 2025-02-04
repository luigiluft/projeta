import { useState } from "react";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { Column, Task, View } from "@/types/project";

export default function TaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "itemType", label: "Tipo de Item", visible: true },
    { id: "itemKey", label: "Chave do Item", visible: true },
    { id: "itemId", label: "ID do Item", visible: true },
    { id: "summary", label: "Resumo", visible: true },
    { id: "assignee", label: "Responsável", visible: true },
    { id: "assigneeId", label: "ID do Responsável", visible: true },
    { id: "reporter", label: "Relator", visible: true },
    { id: "reporterId", label: "ID do Relator", visible: true },
    { id: "priority", label: "Prioridade", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "resolution", label: "Resolução", visible: true },
    { id: "created", label: "Criado", visible: true },
    { id: "updated", label: "Atualizado", visible: true },
    { id: "resolved", label: "Resolvido", visible: true },
    { id: "components", label: "Componentes", visible: true },
    { id: "affectedVersion", label: "Versão Afetada", visible: true },
    { id: "fixVersion", label: "Versão de Correção", visible: true },
    { id: "sprints", label: "Sprints", visible: true },
    { id: "timeTracking", label: "Histórico de Tempo", visible: true },
    { id: "internalLinks", label: "Links Internos", visible: true },
    { id: "externalLinks", label: "Links Externos", visible: true },
    { id: "originalEstimate", label: "Estimativa Original", visible: true },
    { id: "parentId", label: "ID do Pai", visible: true },
    { id: "parentSummary", label: "Resumo do Pai", visible: true },
    { id: "startDate", label: "Data de Início", visible: true },
    { id: "totalOriginalEstimate", label: "Σ Estimativa Original", visible: true },
    { id: "totalTimeSpent", label: "Σ Tempo Gasto", visible: true },
    { id: "remainingEstimate", label: "Σ Estimativa Restante", visible: true }
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