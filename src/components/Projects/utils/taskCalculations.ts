
import { Task } from "@/types/project";
import { isSustainmentTask } from "./taskUtils";
import { calculateTaskHours, calculateTaskCost } from "./taskCalculator";

export { calculateTaskHours } from "./taskCalculator";

export const separateTasks = (tasks: Task[]) => {
  console.log(`Separando ${tasks.length} tarefas entre implementação e sustentação`);
  
  const sustainment: Task[] = [];
  const implementation: Task[] = [];
  
  tasks.forEach(task => {
    if (isSustainmentTask(task)) {
      sustainment.push(task);
    } else {
      implementation.push(task);
    }
  });
  
  console.log(`Resultado: ${implementation.length} tarefas de implementação, ${sustainment.length} tarefas de sustentação`);
  
  return { implementation, sustainment };
};

export const processTasks = (tasks: Task[], attributeValues: Record<string, number> = {}) => {
  if (!tasks || tasks.length === 0) {
    console.log("Nenhuma tarefa para processar");
    return [];
  }
  
  console.log(`Processando ${tasks.length} tarefas com ${Object.keys(attributeValues).length} atributos`);
  
  return tasks.map(task => {
    const processedTask = { ...task };
    const calculatedHours = calculateTaskHours(processedTask, attributeValues);
    processedTask.calculated_hours = calculatedHours;
    
    console.log(`Horas calculadas para tarefa "${processedTask.task_name}": ${calculatedHours}h`);
    
    return processedTask;
  });
};

export const calculateCosts = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) {
    return {
      totalHours: 0,
      totalCost: 0,
      averageHourlyRate: 0,
      taskCount: 0
    };
  }

  const costs = tasks.reduce((acc, task) => {
    const hours = task.calculated_hours ?? task.fixed_hours ?? 0;
    const taskCost = calculateTaskCost(task, hours);
    
    console.log(`Tarefa "${task.task_name}": ${hours}h x R$${taskCost/hours}/h = R$${taskCost}`);
    
    return {
      hours: acc.hours + hours,
      cost: acc.cost + taskCost,
      count: acc.count + 1
    };
  }, { hours: 0, cost: 0, count: 0 });

  return {
    totalHours: costs.hours,
    totalCost: costs.cost,
    averageHourlyRate: costs.hours > 0 ? costs.cost / costs.hours : 0,
    taskCount: costs.count
  };
};
