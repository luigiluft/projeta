
import { Task } from "@/types/project";

// Rates para diferentes papéis na equipe
export const teamRates = {
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

// Função para calcular custos a partir de uma lista de tarefas
export const calculateCosts = (taskList: Task[]) => {
  // Log para depuração
  console.log(`Calculando custos para ${taskList.length} tarefas.`);
  
  const costs = taskList.reduce((acc, task) => {
    // Determinar horas (calculadas ou fixas)
    const hours = task.calculated_hours !== undefined ? task.calculated_hours : 
                 (task.fixed_hours !== undefined ? task.fixed_hours : 0);
                 
    // Determinar taxa horária
    const hourlyRate = task.owner && teamRates[task.owner as keyof typeof teamRates] ? 
                      teamRates[task.owner as keyof typeof teamRates] : 0;
    
    // Calcular custo desta tarefa
    const taskCost = hourlyRate * hours;
    
    // Log de detalhes por tarefa
    console.log(`Tarefa ${task.id} (${task.task_name}): ${hours}h x R$${hourlyRate}/h = R$${taskCost}`);
    
    return {
      hours: acc.hours + hours,
      cost: acc.cost + taskCost
    };
  }, { hours: 0, cost: 0 });

  return {
    totalHours: costs.hours,
    totalCost: costs.cost,
    averageHourlyRate: costs.hours > 0 ? costs.cost / costs.hours : 0
  };
};

// Função para formatar valores monetários
export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Função para processar fórmulas de cálculo de horas
export const processHoursFormula = (formula: string, attributeValues: Record<string, number>) => {
  if (!formula) return "0";
  
  console.log("Fórmula original:", formula);
  console.log("Atributos disponíveis:", attributeValues);
  
  // Substituir atributos com valores na fórmula
  let processedFormula = formula;
  
  // Substituir os atributos na fórmula
  Object.entries(attributeValues).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    processedFormula = processedFormula.replace(regex, value.toString());
  });
  
  console.log("Fórmula após substituição de atributos:", processedFormula);
  
  // Implementar funções personalizadas
  // IF(condition, trueValue, falseValue)
  processedFormula = processedFormula.replace(/IF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/gi, 
    (match, condition, trueVal, falseVal) => {
      return `(${condition} ? ${trueVal} : ${falseVal})`;
    }
  );

  // ROUNDUP(value)
  processedFormula = processedFormula.replace(/ROUNDUP\s*\(\s*([^)]+)\s*\)/gi, 
    (match, value) => {
      return `Math.ceil(${value})`;
    }
  );

  // ROUNDDOWN(value)
  processedFormula = processedFormula.replace(/ROUNDDOWN\s*\(\s*([^)]+)\s*\)/gi, 
    (match, value) => {
      return `Math.floor(${value})`;
    }
  );

  // ROUND(value, decimals)
  processedFormula = processedFormula.replace(/ROUND\s*\(\s*([^,]+),\s*([^)]+)\s*\)/gi, 
    (match, value, decimals) => {
      return `(Math.round(${value} * Math.pow(10, ${decimals})) / Math.pow(10, ${decimals}))`;
    }
  );

  // SUM(value1, value2, ...)
  processedFormula = processedFormula.replace(/SUM\s*\(\s*([^)]+)\s*\)/gi, 
    (match, values) => {
      const valueArray = values.split(',').map(v => v.trim());
      return `(${valueArray.join(' + ')})`;
    }
  );

  // MAX(value1, value2, ...)
  processedFormula = processedFormula.replace(/MAX\s*\(\s*([^)]+)\s*\)/gi, 
    (match, values) => {
      const valueArray = values.split(',').map(v => v.trim());
      return `Math.max(${valueArray.join(', ')})`;
    }
  );

  // MIN(value1, value2, ...)
  processedFormula = processedFormula.replace(/MIN\s*\(\s*([^)]+)\s*\)/gi, 
    (match, values) => {
      const valueArray = values.split(',').map(v => v.trim());
      return `Math.min(${valueArray.join(', ')})`;
    }
  );
  
  console.log("Fórmula após tratamento de funções:", processedFormula);
  
  return processedFormula;
};

// Função para calcular horas das tarefas com base em uma fórmula
export const calculateTaskHours = (task: Task, attributeValues: Record<string, number>): number => {
  if (!task) return 0;
  
  if (task.hours_formula && task.hours_type !== 'fixed') {
    try {
      const formula = processHoursFormula(task.hours_formula, attributeValues);
      
      // Calcular o resultado da fórmula de maneira segura
      // eslint-disable-next-line no-new-func
      const calculatedHours = new Function(`return ${formula}`)();
      
      if (!isNaN(calculatedHours)) {
        console.log(`Horas calculadas para tarefa ${task.id} (${task.task_name}):`, calculatedHours);
        return Number(calculatedHours);
      }
    } catch (error) {
      console.error('Erro ao calcular fórmula:', task.hours_formula, error);
    }
  } else if (task.fixed_hours) {
    return task.fixed_hours;
  } else if (task.calculated_hours) {
    return task.calculated_hours;
  }
  
  return 0;
};

// Função para separar tarefas entre implementação e sustentação
export const separateTasks = (tasks: Task[]) => {
  console.log("Verificando separação de tarefas entre implementação e sustentação");
  
  const sustainment = tasks.filter(task => 
    task.phase?.toLowerCase() === 'sustentação' || 
    task.phase?.toLowerCase() === 'sustentacao'
  );
  
  // Tarefas que não são de sustentação são de implementação
  const implementation = tasks.filter(task => !sustainment.includes(task));
  
  console.log(`Separação de tarefas: ${implementation.length} implementação, ${sustainment.length} sustentação`);
  console.log('Tarefas de implementação:', implementation.map(t => t.epic));
  console.log('Tarefas de sustentação:', sustainment.map(t => t.epic));
  
  return { implementation, sustainment };
};

// Função para processar tarefas e calcular horas
export const processTasks = (tasks: Task[], attributeValues: Record<string, number>) => {
  // Log geral para debug
  console.log(`Processando ${tasks.length} tarefas com ${Object.keys(attributeValues).length} atributos`);
  console.log("Atributos formatados para cálculos:", attributeValues);

  // Criar um novo array com tarefas processadas para não mutar o original
  const processedTasks = tasks.map(task => {
    // Criar uma cópia da tarefa para não mutar o objeto original
    const newTask = { ...task };
    
    if (task.hours_type === 'formula' && task.hours_formula) {
      try {
        const calculatedHours = calculateTaskHours(task, attributeValues);
        newTask.calculated_hours = calculatedHours;
        
        console.log(`Tarefa "${task.task_name}" (${task.id}): Fórmula "${task.hours_formula}" = ${calculatedHours}h`);
      } catch (error) {
        console.error(`Erro ao calcular horas para tarefa "${task.task_name}":`, error);
        newTask.calculated_hours = 0;
      }
    } else if (task.fixed_hours) {
      // Garantir que calculated_hours esteja definido mesmo para tarefas com horas fixas
      newTask.calculated_hours = task.fixed_hours;
      console.log(`Tarefa "${task.task_name}" (${task.id}): Horas fixas = ${task.fixed_hours}h`);
    } else if (task.hours_formula) {
      // Tentar calcular horas a partir da fórmula mesmo se hours_type não estiver definido
      try {
        const calculatedHours = calculateTaskHours(task, attributeValues);
        newTask.calculated_hours = calculatedHours;
        console.log(`Tarefa "${task.task_name}" (${task.id}): Fórmula "${task.hours_formula}" (sem tipo) = ${calculatedHours}h`);
      } catch (error) {
        console.error(`Erro ao calcular fórmula sem tipo para tarefa "${task.task_name}":`, error);
      }
    }
    
    return newTask;
  });
  
  // Log adicional depois de processar todas as tarefas
  console.log("Tarefas após processamento:", processedTasks.map(t => ({
    id: t.id,
    name: t.task_name,
    calculated_hours: t.calculated_hours,
    fixed_hours: t.fixed_hours
  })));
  
  return processedTasks;
};
