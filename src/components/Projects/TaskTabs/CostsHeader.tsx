
import { Task } from "@/types/project";
import { calculateCosts, formatCurrency } from "../utils/taskCalculations";

interface CostsHeaderProps {
  tasks: Task[];
  title: string;
}

export function CostsHeader({ tasks, title }: CostsHeaderProps) {
  const costs = calculateCosts(tasks);

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
