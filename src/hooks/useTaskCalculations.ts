
import { Task } from "@/types/project";
import { useMemo } from "react";

export interface TaskCosts {
  totalHours: number;
  totalCost: number;
  averageHourlyRate: number;
}

export const useTaskCalculations = (tasks: Task[] = []) => {
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
    if (!tasks || !tasks.length) {
      console.log("useTaskCalculations: Nenhuma tarefa disponível para cálculo");
      return { hours: 0, cost: 0 };
    }

    console.log(`useTaskCalculations: Calculando custos para ${tasks.length} tarefas`);
    console.log("Tarefas para cálculo:", tasks.map(t => ({
      id: t.id,
      nome: t.task_name,
      calculatedHours: t.calculated_hours, 
      fixedHours: t.fixed_hours,
      owner: t.owner,
      epic: t.epic,
      phase: t.phase
    })));
    
    return tasks.reduce((acc, task) => {
      // Usar qualquer valor disponível: calculated_hours, fixed_hours ou 0
      const hours = typeof task.calculated_hours === 'number' ? task.calculated_hours : 
                   (typeof task.fixed_hours === 'number' ? task.fixed_hours : 0);
      
      // Determinar a taxa horária com base no proprietário da tarefa
      const hourlyRate = task.owner && TEAM_RATES[task.owner as keyof typeof TEAM_RATES] ? 
                        TEAM_RATES[task.owner as keyof typeof TEAM_RATES] : 0;
      
      // Calcular o custo para esta tarefa
      const taskCost = hourlyRate * hours;
      
      console.log(`Tarefa "${task.task_name}": ${hours}h x R$${hourlyRate}/h = R$${taskCost}`);
      
      // Acumular horas e custo
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
