
import { DraggableTable } from "@/components/ui/draggable-table";
import { format } from "date-fns";
import { Task, Column } from "@/types/project";

interface TaskListProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export function TaskList({ tasks, columns, onColumnsChange }: TaskListProps) {
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
    
    if (columnId === "created_at") {
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
      <DraggableTable
        columns={columns}
        onColumnsChange={onColumnsChange}
        data={tasks}
        formatValue={formatValue}
      />
    </div>
  );
}
