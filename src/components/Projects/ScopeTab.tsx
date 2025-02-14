
import { TaskList } from "@/components/TaskManagement/TaskList";
import { Column, Task } from "@/types/project";

interface ScopeTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

const teamRates = {
  "BK": 78.75,
  "DS": 48.13,
  "PMO": 87.50,
  "PO": 35.00,
  "CS": 48.13,
  "FRJ": 70.00,
  "FRP": 119.00,
  "BKT": 131.04,
  "ATS": 65.85,
};

export function ScopeTab({ tasks, columns, onColumnsChange }: ScopeTabProps) {
  const calculateCosts = () => {
    const costs = tasks.reduce((acc, task) => {
      const hourlyRate = teamRates[task.owner as keyof typeof teamRates] || 0;
      const taskCost = hourlyRate * (task.hours || 0);
      return {
        hours: acc.hours + (task.hours || 0),
        cost: acc.cost + taskCost
      };
    }, { hours: 0, cost: 0 });

    return {
      totalHours: costs.hours,
      totalCost: costs.cost,
      averageHourlyRate: costs.hours > 0 ? costs.cost / costs.hours : 0
    };
  };

  const costs = calculateCosts();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista de Tarefas</h3>
        <div className="space-y-1 text-right">
          <div className="text-sm text-gray-600">
            Total de Horas: {costs.totalHours}h
          </div>
          <div className="text-sm font-medium text-primary">
            Custo Total: {formatCurrency(costs.totalCost)}
          </div>
          <div className="text-xs text-gray-500">
            Média HH: {formatCurrency(costs.averageHourlyRate)}/h
          </div>
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
