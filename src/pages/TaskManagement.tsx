import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { toast } from "sonner";

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "priority", label: "Prioridade", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "responsible", label: "Responsável", visible: true },
    { id: "timeMin", label: "Tempo Min.", visible: true },
    { id: "timeMed", label: "Tempo Méd.", visible: true },
    { id: "timeMax", label: "Tempo Máx.", visible: true },
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const handleSubmit = (values: Omit<Task, "id">) => {
    setTasks([...tasks, { ...values, id: crypto.randomUUID() }]);
    setIsFormOpen(false);
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    const newView = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: columns.filter(col => col.visible).map(col => col.id),
    };
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(columns.map(col => ({
      ...col,
      visible: view.columns.includes(col.id),
    })));
  };

  const handleImportSpreadsheet = () => {
    // Implement spreadsheet import logic here
    console.log("Import spreadsheet clicked");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
              <ActionButtons
                columns={columns}
                savedViews={savedViews}
                onColumnVisibilityChange={handleColumnVisibilityChange}
                onSaveView={handleSaveView}
                onLoadView={handleLoadView}
                onNewAttribute={() => setIsFormOpen(true)}
                onImportSpreadsheet={handleImportSpreadsheet}
              />
            </div>

            <TaskList tasks={tasks} columns={columns} />
          </div>
        </main>
      </div>

      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}