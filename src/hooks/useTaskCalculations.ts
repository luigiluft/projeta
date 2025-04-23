
import { Task } from "@/types/project";
import { useMemo } from "react";

export interface TaskCosts {
  totalHours: number;
  totalCost: number;
  averageHourlyRate: number;
}

export const useTaskCalculations = (tasks: Task[]) => {
  const TEAM_RATES = {
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

  const costs = useMemo(() => {
    const validTasks = tasks.filter(task => task && task.hours_formula);
    console.log("Calculando custos para tarefas válidas:", validTasks.length);

    return validTasks.reduce((acc, task) => {
      const hours = task.calculated_hours || task.fixed_hours || 0;
      const hourlyRate = task.owner && TEAM_RATES[task.owner as keyof typeof TEAM_RATES] ? 
                        TEAM_RATES[task.owner as keyof typeof TEAM_RATES] : 0;
      
      const taskCost = hourlyRate * hours;
      
      console.log(`Tarefa "${task.task_name}": ${hours}h x R$${hourlyRate}/h = R$${taskCost}`);
      
      return {
        hours: acc.hours + hours,
        cost: acc.cost + taskCost
      };
    }, { hours: 0, cost: 0 });
  }, [tasks]);

  return {
    totalHours: costs.hours,
    totalCost: costs.cost,
    averageHourlyRate: costs.hours > 0 ? costs.cost / costs.hours : 0
  };
};
