
import { formatCurrency } from "../../utils/taskCalculations";
import { useTaskCalculations } from "@/hooks/useTaskCalculations";
import { Task } from "@/types/project";

interface TaskCostsProps {
  tasks: Task[];
  title: string;
}

export function TaskCosts({ tasks, title }: TaskCostsProps) {
  const costs = useTaskCalculations(tasks);
  
  console.log(`TaskCosts - ${title}:`, {
    tasks: tasks.length,
    tarefas: tasks.map(t => ({ 
      id: t.id, 
      nome: t.task_name, 
      phase: t.phase,
      epic: t.epic,
      hours: t.calculated_hours 
    })),
    totalHours: costs.totalHours,
    totalCost: costs.totalCost,
    averageHourlyRate: costs.averageHourlyRate
  });

  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-1 text-right">
        <div className="text-sm text-gray-600">
          Total de Horas: {costs.totalHours.toFixed(2)}h
        </div>
        <div className="text-sm font-medium text-primary">
          Custo Total: {formatCurrency(costs.totalCost)}
        </div>
        <div className="text-xs text-gray-500">
          Média HH: {formatCurrency(costs.averageHourlyRate)}/h
        </div>
      </div>
    </div>
  );
}
