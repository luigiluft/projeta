import { useState } from "react";
import { Plus, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Layout/Header";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { ColumnManager } from "@/components/TaskManagement/ColumnManager";
import { ViewManager } from "@/components/TaskManagement/ViewManager";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "urgent":
        return "text-red-600";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "backlog":
        return "bg-gray-100";
      case "in_progress":
        return "bg-blue-100";
      case "done":
        return "bg-green-100";
    }
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
              <div className="flex items-center gap-4">
                <ColumnManager
                  columns={columns}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                />
                <ViewManager
                  onSaveView={handleSaveView}
                  onLoadView={handleLoadView}
                  savedViews={savedViews}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Tarefa
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-lg">
                    <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Tarefa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportSpreadsheet}>
                      <FilePlus className="mr-2 h-4 w-4" />
                      Importar Planilha
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns
                      .filter(col => col.visible)
                      .map(column => (
                        <TableHead key={column.id}>{column.label}</TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      {columns
                        .filter(col => col.visible)
                        .map(column => (
                          <TableCell key={`${task.id}-${column.id}`}>
                            {column.id === "priority" ? (
                              <span className={getPriorityColor(task.priority)}>
                                {task.priority === "low" && "Baixa"}
                                {task.priority === "medium" && "Média"}
                                {task.priority === "high" && "Alta"}
                                {task.priority === "urgent" && "Urgente"}
                              </span>
                            ) : column.id === "status" ? (
                              <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                                {task.status === "backlog" && "Backlog"}
                                {task.status === "in_progress" && "Em Andamento"}
                                {task.status === "done" && "Concluído"}
                              </span>
                            ) : (
                              task[column.id as keyof Task]
                            )}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                  {tasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.filter(col => col.visible).length} className="text-center py-4 text-gray-500">
                        Nenhuma tarefa cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
