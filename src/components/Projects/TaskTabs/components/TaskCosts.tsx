
import { formatCurrency } from "../../utils/taskCalculations";
import { useTaskCalculations } from "@/hooks/useTaskCalculations";
import { Task } from "@/types/project";

interface TaskCostsProps {
  tasks: Task[];
  title: string;
}

export function TaskCosts({ tasks, title }: TaskCostsProps) {
  const metrics = useTaskCalculations(tasks);
  
  console.log(`TaskCosts - ${title}:`, {
    tasks: tasks.length,
    tarefas: tasks.map(t => ({ 
      id: t.id, 
      nome: t.task_name, 
      phase: t.phase,
      epic: t.epic,
      hours: t.calculated_hours 
    })),
    hoursSum: metrics.hoursSum,
    costSum: metrics.costSum,
    hourlyRate: metrics.hourlyRate,
    taskCount: metrics.taskCount
  });

  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-1 text-right">
        <div className="text-sm text-gray-600">
          Quantidade de Tarefas: {metrics.taskCount}
        </div>
        <div className="text-sm text-gray-600">
          Volume Total: {metrics.hoursSum.toFixed(2)}h
        </div>
        <div className="text-sm font-medium text-primary">
          Valor Total: {formatCurrency(metrics.costSum)}
        </div>
        <div className="text-xs text-gray-500">
          Valor Médio/h: {formatCurrency(metrics.hourlyRate)}/h
        </div>
      </div>
    </div>
  );
}
