
import { DraggableTable } from "@/components/ui/draggable-table";
import { format } from "date-fns";
import { Task, Column } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export interface TaskListProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  selectedTasks?: string[];
}

export function TaskList({ 
  tasks, 
  columns, 
  onColumnsChange, 
  onTaskSelect,
  selectedTasks = []
}: TaskListProps) {
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
        <div className="flex items-center space-x-2">
          {onTaskSelect && rowData && (
            <Checkbox 
              checked={selectedTasks.includes(rowData.id)}
              onCheckedChange={(checked) => onTaskSelect(rowData.id, checked === true)}
              aria-label="Selecionar tarefa"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/task-management/${rowData?.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (value === null || value === undefined) return "";
    
    if (columnId === "created_at") {
      return formatDate(value);
    }
    
    if (columnId === "status") {
      const statusMap: Record<string, string> = {
        "pending": "Pendente",
        "in_progress": "Em Progresso",
        "completed": "Concluído"
      };
      return statusMap[value] || value;
    }
    
    if (columnId === "is_active") {
      return value ? "Sim" : "Não";
    }
    
    if (columnId === "depends_on" && value) {
      return typeof value === 'string' ? value.substring(0, 8) + '...' : value;
    }
    
    if (columnId === "hours_formula") {
      return value || '';
    }
    
    if (columnId === "fixed_hours") {
      return value || '0';
    }
    
    if (columnId === "order") {
      return value || '-';
    }
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (typeof value === "number") {
      return value.toString();
    }
    
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    
    return value;
  };

  // Definir todas as colunas disponíveis na tabela tasks
  const allTaskColumns = [
    { id: "id", label: "ID", visible: true },
    { id: "task_name", label: "Tarefa", visible: true },
    { id: "phase", label: "Fase", visible: true },
    { id: "epic", label: "Epic", visible: true },
    { id: "story", label: "Story", visible: true },
    { id: "hours_formula", label: "Fórmula de Horas", visible: true },
    { id: "fixed_hours", label: "Horas Fixas", visible: true },
    { id: "owner", label: "Responsável", visible: true },
    { id: "is_active", label: "Ativo", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "order", label: "Ordem", visible: true },
    { id: "depends_on", label: "Dependência", visible: true },
    { id: "hours_type", label: "Tipo de Horas", visible: true },
    { id: "created_at", label: "Criado em", visible: true },
    { id: "actions", label: "Ações", visible: true },
  ];
  
  console.log("All task columns in TaskList:", allTaskColumns.map(c => c.id));

  return (
    <div className="h-full overflow-auto">
      <DraggableTable
        columns={allTaskColumns}
        onColumnsChange={onColumnsChange}
        data={tasks}
        formatValue={formatValue}
      />
    </div>
  );
}
