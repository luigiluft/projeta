
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
  const costs = taskList.reduce((acc, task) => {
    if (task.is_third_party_cost && task.cost_amount) {
      // Se for um custo com terceiros, adiciona diretamente ao custo total
      return {
        hours: acc.hours,
        cost: acc.cost + task.cost_amount
      };
    } else {
      // Caso contrário, calcula normalmente com base nas horas
      const hourlyRate = teamRates[task.owner as keyof typeof teamRates] || 0;
      const hours = task.calculated_hours || 0;
      const taskCost = hourlyRate * hours;
      return {
        hours: acc.hours + hours,
        cost: acc.cost + taskCost
      };
    }
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
  // Substituir atributos com valores na fórmula
  let processedFormula = formula;
  
  // Substituir os atributos na fórmula
  Object.entries(attributeValues).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    processedFormula = processedFormula.replace(regex, value.toString());
  });
  
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
  
  return processedFormula;
};

// Função para calcular horas das tarefas com base em uma fórmula
export const calculateTaskHours = (task: Task, attributeValues: Record<string, number>): number => {
  // Se for um custo com terceiros, retorna 0 horas
  if (task.is_third_party_cost) {
    return 0;
  }
  
  if (task.hours_formula && task.hours_type !== 'fixed') {
    try {
      const formula = processHoursFormula(task.hours_formula, attributeValues);
      
      // Calcular o resultado da fórmula de maneira segura
      // eslint-disable-next-line no-new-func
      const calculatedHours = new Function(`return ${formula}`)();
      
      if (!isNaN(calculatedHours)) {
        return calculatedHours;
      }
    } catch (error) {
      console.error('Erro ao calcular fórmula:', task.hours_formula, error);
    }
  } else if (task.fixed_hours) {
    return task.fixed_hours;
  }
  
  return 0;
};

// Função para separar tarefas entre implementação e sustentação
export const separateTasks = (tasks: Task[]) => {
  const implementation = tasks.filter(task => 
    !task.epic.toLowerCase().includes('sustentação') && 
    !task.epic.toLowerCase().includes('sustentacao'));
  
  const sustainment = tasks.filter(task => 
    task.epic.toLowerCase().includes('sustentação') || 
    task.epic.toLowerCase().includes('sustentacao'));
  
  return { implementation, sustainment };
};

// Função para processar tarefas e calcular horas
export const processTasks = (tasks: Task[], attributeValues: Record<string, number>) => {
  return tasks.map(task => {
    const newTask = { ...task };
    newTask.calculated_hours = calculateTaskHours(task, attributeValues);
    return newTask;
  });
};
