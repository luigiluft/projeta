
import { Task } from "@/types/project";
import { useMemo } from "react";
import { teamRates } from "@/components/Projects/utils/taskCalculations";

export interface TaskCostMetrics {
  hoursSum: number;
  costSum: number;
  hourlyRate: number;
  taskCount: number;
}

export const useTaskCalculations = (tasks: Task[] = []) => {
  const metrics = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      console.log("useTaskCalculations: Nenhuma tarefa para calcular");
      return { hoursSum: 0, costSum: 0, hourlyRate: 0, taskCount: 0 };
    }

    console.log(`useTaskCalculations: Calculando métricas para ${tasks.length} tarefas`);
    
    // Exibir detalhes de cada tarefa para debug
    console.log("Tarefas para cálculo de métricas:", tasks.map(t => ({
      id: t.id,
      nome: t.task_name,
      calculatedHours: t.calculated_hours, 
      fixedHours: t.fixed_hours,
      owner: t.owner,
      epic: t.epic,
      phase: t.phase
    })));
    
    // Reduzir as tarefas para calcular os totais
    const result = tasks.reduce((acc, task) => {
      // Determinar horas (usar calculated_hours ou fixed_hours)
      const hours = task.calculated_hours !== undefined && task.calculated_hours !== null 
        ? task.calculated_hours 
        : (task.fixed_hours !== undefined && task.fixed_hours !== null ? task.fixed_hours : 0);
      
      // Determinar taxa horária baseada no owner
      const hourlyRate = task.owner && teamRates[task.owner as keyof typeof teamRates] 
        ? teamRates[task.owner as keyof typeof teamRates] 
        : 70; // Taxa padrão caso não tenha owner ou taxa definida
      
      // Calcular custo desta tarefa
      const taskCost = hourlyRate * hours;
      
      // Registrar detalhes do cálculo
      console.log(`Tarefa "${task.task_name}" (${task.id}): ${hours}h x R$${hourlyRate}/h = R$${taskCost.toFixed(2)}`);
      
      // Atualizar acumuladores
      return {
        hoursSum: acc.hoursSum + hours,
        costSum: acc.costSum + taskCost,
        taskCount: acc.taskCount + 1
      };
    }, { hoursSum: 0, costSum: 0, taskCount: 0 });
    
    // Calcular taxa média
    const hourlyRate = result.hoursSum > 0 ? result.costSum / result.hoursSum : 0;
    
    console.log("Métricas calculadas:", {
      horasTotal: result.hoursSum,
      custoTotal: result.costSum,
      taxaMedia: hourlyRate,
      numTarefas: result.taskCount
    });
    
    return {
      hoursSum: result.hoursSum,
      costSum: result.costSum,
      hourlyRate: hourlyRate,
      taskCount: result.taskCount
    };
  }, [tasks]);

  return metrics;
};
