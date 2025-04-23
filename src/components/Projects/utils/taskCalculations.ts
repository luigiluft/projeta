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
  
  console.log(`Calculando horas para tarefa "${task.task_name}" (${task.id})`);
  console.log(`  hours_type: ${task.hours_type}, hours_formula: ${task.hours_formula}, fixed_hours: ${task.fixed_hours}`);
  
  if (task.hours_formula) {
    try {
      const formula = processHoursFormula(task.hours_formula, attributeValues);
      
      // Calcular o resultado da fórmula de maneira segura
      // eslint-disable-next-line no-new-func
      const calculatedHours = new Function(`return ${formula}`)();
      
      if (!isNaN(calculatedHours)) {
        console.log(`  Horas calculadas: ${calculatedHours}`);
        return Number(calculatedHours);
      } else {
        console.log(`  Erro: Resultado da fórmula é NaN`);
      }
    } catch (error) {
      console.error('  Erro ao calcular fórmula:', task.hours_formula, error);
    }
  } else if (task.fixed_hours !== undefined && task.fixed_hours !== null) {
    console.log(`  Usando horas fixas: ${task.fixed_hours}`);
    return task.fixed_hours;
  } else if (task.calculated_hours !== undefined && task.calculated_hours !== null) {
    console.log(`  Usando horas já calculadas: ${task.calculated_hours}`);
    return task.calculated_hours;
  }
  
  console.log(`  Nenhuma hora definida, retornando 0`);
  return 0;
};

// Função para normalizar texto (remover acentos e converter para minúsculas)
const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Função para separar tarefas entre implementação e sustentação
export const separateTasks = (tasks: Task[]) => {
  console.log("Verificando separação de tarefas entre implementação e sustentação");
  
  const sustainment = tasks.filter(task => {
    const phase = normalizeText(task.phase || '');
    const epic = normalizeText(task.epic || '');
    
    // Log detalhado para cada tarefa
    console.log(`Tarefa "${task.task_name}" (${task.id}):`, {
      phase,
      epic,
      isSustainment: 
        phase.includes('sustentacao') || 
        epic.includes('sustentacao') ||
        epic.includes('atendimento ao consumidor') ||
        epic.includes('sac 4.0') ||
        epic.includes('faturamento de gestao operacional') ||
        epic.includes('faturamento e gestao operacional')
    });
    
    return (
      phase.includes('sustentacao') || 
      epic.includes('sustentacao') ||
      epic.includes('atendimento ao consumidor') ||
      epic.includes('sac 4.0') ||
      epic.includes('faturamento de gestao operacional') ||
      epic.includes('faturamento e gestao operacional')
    );
  });
  
  // Tarefas que não são de sustentação são de implementação
  const implementation = tasks.filter(task => !sustainment.includes(task));
  
  console.log(`Separação de tarefas: ${implementation.length} implementação, ${sustainment.length} sustentação`);
  console.log('Tarefas de implementação:', implementation.map(t => ({
    id: t.id,
    name: t.task_name,
    phase: t.phase,
    epic: t.epic
  })));
  console.log('Tarefas de sustentação:', sustainment.map(t => ({
    id: t.id,
    name: t.task_name,
    phase: t.phase,
    epic: t.epic
  })));
  
  return { implementation, sustainment };
};

// Função para processar tarefas e calcular horas
export const processTasks = (tasks: Task[], attributeValues: Record<string, number> = {}) => {
  if (!tasks || tasks.length === 0) {
    console.log("Nenhuma tarefa para processar");
    return [];
  }
  
  // Log geral para debug
  console.log(`Processando ${tasks.length} tarefas com ${Object.keys(attributeValues).length} atributos`);
  
  // Criar um novo array com tarefas processadas para não mutar o original
  const processedTasks = tasks.map(task => {
    // Criar uma cópia da tarefa para não mutar o objeto original
    const newTask = { ...task };
    
    // Tentar calcular horas para a tarefa, independentemente do tipo de horas
    try {
      const calculatedHours = calculateTaskHours(task, attributeValues);
      newTask.calculated_hours = calculatedHours;
      
      console.log(`Tarefa "${task.task_name}" (${task.id}): ${
        task.hours_formula 
          ? `Fórmula "${task.hours_formula}"` 
          : `Horas fixas ${task.fixed_hours}`
      } = ${calculatedHours}h`);
    } catch (error) {
      console.error(`Erro ao calcular horas para tarefa "${task.task_name}":`, error);
      // Garantir que sempre tenhamos um valor para calculated_hours
      newTask.calculated_hours = task.fixed_hours || 0;
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
