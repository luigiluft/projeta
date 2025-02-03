import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Layout/Header";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function TaskManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleSubmit = (values: Omit<Task, "id">) => {
    setTasks([...tasks, { ...values, id: crypto.randomUUID() }]);
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
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Tarefa
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Tempo Min.</TableHead>
                    <TableHead>Tempo Méd.</TableHead>
                    <TableHead>Tempo Máx.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name}</TableCell>
                      <TableCell className="capitalize">{task.type}</TableCell>
                      <TableCell>
                        <span className={getPriorityColor(task.priority)}>
                          {task.priority === "low" && "Baixa"}
                          {task.priority === "medium" && "Média"}
                          {task.priority === "high" && "Alta"}
                          {task.priority === "urgent" && "Urgente"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                          {task.status === "backlog" && "Backlog"}
                          {task.status === "in_progress" && "Em Andamento"}
                          {task.status === "done" && "Concluído"}
                        </span>
                      </TableCell>
                      <TableCell>{task.responsible}</TableCell>
                      <TableCell>{task.timeMin}h</TableCell>
                      <TableCell>{task.timeMed}h</TableCell>
                      <TableCell>{task.timeMax}h</TableCell>
                    </TableRow>
                  ))}
                  {tasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
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