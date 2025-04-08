
import { Task } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TaskItemProps {
  task: Task;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  isSelected: boolean;
}

export function TaskItem({
  task,
  onTaskSelect,
  isSelected
}: TaskItemProps) {
  const navigate = useNavigate();

  const handleTaskClick = () => {
    navigate(`/task-management/${task.id}`);
  };

  const handleEditTask = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique no botão editar propague para o clique na tarefa
    navigate(`/task-management/${task.id}`);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onTaskSelect) {
      onTaskSelect(task.id, e.target.checked);
      e.stopPropagation();
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200"
    };
    return statusColors[status] || statusColors.pending;
  };

  return (
    <div
      className="flex flex-col p-2 hover:bg-gray-50 rounded-md cursor-pointer border border-gray-100"
      onClick={handleTaskClick}
    >
      <div className="flex items-center mb-2">
        {onTaskSelect && (
          <input 
            type="checkbox"
            className="h-4 w-4 mr-3 text-blue-600 border-gray-300 rounded"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className="flex-1">
          <div className="font-medium">{task.task_name}</div>
        </div>
        <Badge 
          variant="outline" 
          className={`ml-2 ${getStatusBadgeColor(task.status)}`}
        >
          {task.status}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={handleEditTask}
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
      
      {/* Detalhes adicionais da tarefa */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        {task.owner && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Responsável:</span>
            <span>{task.owner}</span>
          </div>
        )}
        
        {task.hours_type && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Tipo de Horas:</span>
            <span>{task.hours_type}</span>
          </div>
        )}
        
        {(task.calculated_hours !== undefined || task.fixed_hours !== undefined) && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Horas:</span>
            <span>{task.calculated_hours !== undefined ? task.calculated_hours : task.fixed_hours}</span>
          </div>
        )}
        
        {task.order && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Ordem:</span>
            <span>{task.order}</span>
          </div>
        )}
        
        {task.start_date && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Início:</span>
            <span>{new Date(task.start_date).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        {task.end_date && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Término:</span>
            <span>{new Date(task.end_date).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        {task.depends_on && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Depende de:</span>
            <span>{task.depends_on}</span>
          </div>
        )}
      </div>
    </div>
  );
}
