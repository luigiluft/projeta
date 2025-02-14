
import { TaskList } from "@/components/TaskManagement/TaskList";
import { Column, Task } from "@/types/project";

interface ScopeTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export function ScopeTab({ tasks, columns, onColumnsChange }: ScopeTabProps) {
  const calculateTotalTime = () => {
    const total = tasks.reduce((acc, task) => {
      return {
        min: acc.min + Number(task.hours || 0),
        med: acc.med + Number(task.hours || 0),
        max: acc.max + Number(task.hours || 0)
      };
    }, { min: 0, med: 0, max: 0 });

    return `Min: ${total.min}h | Med: ${total.med}h | Max: ${total.max}h`;
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista de Tarefas</h3>
        <div className="text-sm text-gray-600">
          Total de Horas: {calculateTotalTime()}
        </div>
      </div>
      <TaskList 
        tasks={tasks} 
        columns={columns}
        onColumnsChange={onColumnsChange}
      />
    </div>
  );
}
