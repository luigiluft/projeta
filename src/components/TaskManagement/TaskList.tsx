
import { useState, useEffect } from 'react';
import { Task, Column } from "@/types/project";

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

  useEffect(() => {
    const visible = columns
      .filter(col => col.visible)
      .map(col => col.id);
    
    setVisibleColumns(visible);
    
    console.log("TaskList received columns:", columns.map(col => `${col.id} (${col.visible ? 'visible' : 'hidden'})`));
  }, [columns]);

  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderCellContent = (task: Task, columnId: string) => {
    switch (columnId) {
      case 'task_name':
        return task.task_name;
      case 'phase':
        return task.phase;
      case 'epic':
        return task.epic;
      case 'story':
        return task.story;
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
        // Exibir fórmula truncada ou horas fixas
        if (task.hours_formula) {
          return <span title={task.hours_formula}>{truncateText(task.hours_formula, 15)}</span>;
        }
        return task.fixed_hours || '-';
      case 'hours_formula':
        return task.hours_formula ? <span title={task.hours_formula}>{truncateText(task.hours_formula, 15)}</span> : '-';
      case 'fixed_hours':
        return task.fixed_hours || '-';
      case 'owner':
        return task.owner;
      case 'dependency':
        return task.depends_on || '-';
      case 'created_at':
        return new Date(task.created_at).toLocaleDateString();
      case 'status':
        return task.status;
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
