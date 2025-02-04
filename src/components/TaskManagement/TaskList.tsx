import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface Task {
  id: string;
  itemType: string;
  itemKey: string;
  itemId: number;
  summary: string;
  assignee: string;
  assigneeId: string;
  reporter: string;
  reporterId: string;
  priority: string;
  status: string;
  resolution: string;
  created: string;
  updated: string;
  resolved: string;
  components: string;
  affectedVersion: string;
  fixVersion: string;
  sprints: string;
  timeTracking: string;
  internalLinks: string[];
  externalLinks: string;
  originalEstimate: number;
  parentId: number;
  parentSummary: string;
  startDate: string;
  totalOriginalEstimate: number;
  totalTimeSpent: number;
  remainingEstimate: number;
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
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatValue = (value: any, columnId: string) => {
    if (value === null || value === undefined) return "";
    
    if (columnId.includes("date") || columnId === "created" || columnId === "updated" || columnId === "resolved") {
      return formatDate(value);
    }
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (typeof value === "number") {
      return value.toString();
    }
    
    return value;
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
                    {formatValue(task[column.id as keyof Task], column.id)}
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