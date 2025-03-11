
import { useState, useEffect } from 'react';
import { Task, Column } from "@/types/project";
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskListProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange?: (columns: Column[]) => void;
  showHoursColumn?: boolean;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  selectedTasks?: string[];
}

export function TaskList({ 
  tasks, 
  columns, 
  onColumnsChange, 
  showHoursColumn = false,
  onTaskSelect,
  selectedTasks = [] 
}: TaskListProps) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const visible = columns
      .filter(col => col.visible)
      .map(col => col.id);
    
    setVisibleColumns(visible);
    
    console.log("TaskList received columns:", columns.map(col => `${col.id} (${col.visible ? 'visible' : 'hidden'})`));
  }, [columns]);

  const truncateText = (text: string | undefined | null, maxLength: number = 20) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleEditClick = (taskId: string) => {
    console.log(`Navigating to task details: /task-management/${taskId}`);
    navigate(`/task-management/${taskId}`);
  };

  const renderCellContent = (task: Task, columnId: string) => {
    switch (columnId) {
      case 'task_name':
        return truncateText(task.task_name, 30);
      case 'phase':
        return truncateText(task.phase, 15);
      case 'epic':
        return truncateText(task.epic, 15);
      case 'story':
        return truncateText(task.story, 15);
      case 'start_date':
        return formatDate(task.start_date);
      case 'end_date':
        return formatDate(task.end_date);
      case 'hours':
        if (showHoursColumn) {
          return (
            <div className="flex items-center space-x-1">
              <span>{task.calculated_hours !== undefined ? task.calculated_hours.toFixed(2) : '-'}</span>
              {task.hours_type !== 'fixed' && (
                <span className="text-xs text-blue-500" title={task.hours_formula || ''}>
                  (F)
                </span>
              )}
            </div>
          );
        }
        if (task.hours_formula) {
          return <span title={task.hours_formula}>{truncateText(task.hours_formula, 15)}</span>;
        }
        return task.fixed_hours || '-';
      case 'hours_formula':
        return task.hours_formula ? <span title={task.hours_formula}>{truncateText(task.hours_formula, 15)}</span> : '-';
      case 'fixed_hours':
        return task.fixed_hours || '-';
      case 'hours_type':
        return truncateText(task.hours_type, 10);
      case 'order':
        // Mostrar qualquer valor, incluindo zero
        return task.order !== null && task.order !== undefined ? task.order.toString() : '-';
      case 'order_number':
        // Mostrar qualquer valor, incluindo zero
        return task.order_number !== null && task.order_number !== undefined ? task.order_number.toString() : '-';
      case 'dependency':
      case 'depends_on':
        // Não truncar a dependência e mostrar o valor exato
        return task.depends_on !== null && task.depends_on !== undefined ? task.depends_on : '-';
      case 'actions':
        return (
          <div className="flex items-center space-x-2">
            <button 
              className="text-blue-500 hover:text-blue-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditClick(task.id);
              }}
            >
              Editar
            </button>
            <button className="text-red-500 hover:text-red-700">Excluir</button>
          </div>
        );
      case 'is_active':
        return task.is_active ? 'Sim' : 'Não';
      case 'owner':
        return truncateText(task.owner, 10);
      case 'created_at':
        return task.created_at ? new Date(task.created_at).toLocaleDateString() : '-';
      case 'status':
        return truncateText(task.status, 10);
      default:
        return '-';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-center border rounded">
        <p className="text-gray-500">Nenhuma tarefa encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {onTaskSelect && (
              <th className="w-10 px-4 py-3">
                <span className="sr-only">Seleção</span>
              </th>
            )}
            {visibleColumns.map((columnId) => (
              <th 
                key={columnId}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  ['total_hours', 'total_cost', 'progress'].includes(columnId) ? 'text-right' : ''
                }`}
                style={{ minWidth: getColumnMinWidth(columnId) }}
              >
                {columns.find(col => col.id === columnId)?.label || columnId}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              {onTaskSelect && (
                <td className="w-10 px-4 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={selectedTasks.includes(task.id)}
                    onChange={(e) => onTaskSelect(task.id, e.target.checked)}
                  />
                </td>
              )}
              {visibleColumns.map((columnId) => (
                <td 
                  key={`${task.id}-${columnId}`} 
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    ['total_hours', 'total_cost', 'progress'].includes(columnId) ? 'text-right' : ''
                  }`}
                  style={{ minWidth: getColumnMinWidth(columnId) }}
                >
                  {renderCellContent(task, columnId)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getColumnMinWidth(columnId: string): string {
  switch (columnId) {
    case 'task_name':
      return '200px';
    case 'phase':
    case 'epic':
    case 'story':
      return '120px';
    case 'start_date':
    case 'end_date':
      return '100px';
    case 'hours':
    case 'fixed_hours':
    case 'hours_formula':
      return '100px';
    case 'owner':
    case 'status':
    case 'hours_type':
      return '80px';
    case 'is_active':
      return '60px';
    case 'order':
    case 'order_number':
      return '70px';
    case 'dependency':
    case 'depends_on':
      return '110px';
    case 'created_at':
      return '100px';
    default:
      return '100px';
  }
}
