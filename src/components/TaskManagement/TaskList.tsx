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

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface TaskListProps {
  tasks: Task[];
  columns: Column[];
}

export function TaskList({ tasks, columns }: TaskListProps) {
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
  );
}