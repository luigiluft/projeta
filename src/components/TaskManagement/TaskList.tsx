
import { useState, useEffect } from 'react';
import { Task, Column } from "@/types/project";

interface TaskListProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  showHoursColumn?: boolean;
}

export function TaskList({ tasks, columns, onColumnsChange, showHoursColumn = false }: TaskListProps) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  useEffect(() => {
    const visible = columns
      .filter(col => col.visible)
      .map(col => col.id);
    
    setVisibleColumns(visible);
    
    // Log para depuração
    console.log("TaskList received columns:", columns.map(col => `${col.id} (${col.visible ? 'visible' : 'hidden'})`));
  }, [columns]);

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
        return task.hours_formula || task.fixed_hours || '-';
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
            {visibleColumns.includes('task_name') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarefa
              </th>
            )}
            {visibleColumns.includes('phase') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fase
              </th>
            )}
            {visibleColumns.includes('epic') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Epic
              </th>
            )}
            {visibleColumns.includes('story') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Story
              </th>
            )}
            {visibleColumns.includes('hours') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas
              </th>
            )}
            {visibleColumns.includes('owner') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsável
              </th>
            )}
            {visibleColumns.includes('dependency') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dependência
              </th>
            )}
            {visibleColumns.includes('created_at') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
            )}
            {visibleColumns.includes('status') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              {visibleColumns.map((columnId) => (
                <td key={`${task.id}-${columnId}`} className="px-6 py-4 whitespace-nowrap text-sm">
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
