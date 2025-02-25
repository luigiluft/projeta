
import { DraggableTable } from "@/components/ui/draggable-table";
import { format } from "date-fns";
import { Task, Column } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TaskListProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export function TaskList({ tasks, columns, onColumnsChange }: TaskListProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatValue = (value: any, columnId: string, rowData?: Task) => {
    if (columnId === "actions") {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/task-management/${rowData?.id}`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      );
    }

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

  // Adicione a coluna de ações no final
  const columnsWithActions = [
    ...columns.filter(col => col.visible),
    {
      id: "actions",
      label: "Ações",
      visible: true,
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <DraggableTable
        columns={columnsWithActions}
        onColumnsChange={onColumnsChange}
        data={tasks}
        formatValue={formatValue}
      />
    </div>
  );
}
