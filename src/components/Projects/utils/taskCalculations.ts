
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

// Função para formatar valores monetários
export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Função para normalizar texto (remover acentos e converter para minúsculas)
const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Lista de termos que identificam tarefas de sustentação
const SUSTAINMENT_TERMS = [
  'sustentacao',
  'sustentação',
  'atendimento ao consumidor',
  'sac 4.0',
  'faturamento de gestao operacional',
  'faturamento e gestao operacional',
  'faturamento e gestão operacional'
];

// Função para verificar se uma tarefa é de sustentação
const isSustainmentTask = (task: Task): boolean => {
  if (!task) return false;
  
  const phase = normalizeText(task.phase || '');
  const epic = normalizeText(task.epic || '');
  
  return SUSTAINMENT_TERMS.some(term => 
    phase.includes(normalizeText(term)) || epic.includes(normalizeText(term))
  );
};

// Função para separar tarefas entre implementação e sustentação
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

// Função para calcular horas de uma tarefa com base em sua fórmula
export const calculateTaskHours = (task: Task, attributeValues: Record<string, any> = {}): number => {
  if (!task) {
    console.log('Tarefa inválida para cálculo de horas');
    return 0;
  }
  
  console.log(`Calculando horas para tarefa ${task.id} (${task.task_name})`);
  
  // Se a tarefa já tem horas calculadas, retorna esse valor
  if (task.calculated_hours !== undefined && task.calculated_hours !== null) {
    console.log(`Usando horas já calculadas: ${task.calculated_hours}`);
    return task.calculated_hours;
  }
  
  // Se a tarefa tem horas fixas, retorna esse valor
  if (task.fixed_hours !== undefined && task.fixed_hours !== null) {
    console.log(`Usando horas fixas: ${task.fixed_hours}`);
    return task.fixed_hours;
  }
  
  // Se não tem fórmula, retorna 0
  if (!task.hours_formula) {
    console.log('Tarefa sem fórmula de horas');
    return 0;
  }
  
  try {
    console.log(`Avaliando fórmula: ${task.hours_formula}`);
    console.log('Atributos disponíveis:', attributeValues);
    
    // Substituir variáveis na fórmula pelos valores correspondentes
    let formula = task.hours_formula;
    Object.entries(attributeValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        formula = formula.replace(regex, value.toString());
      }
    });
    
    console.log(`Fórmula processada: ${formula}`);
    
    // Avaliar a fórmula
    const result = eval(formula);
    
    // Verificar se o resultado é um número válido
    if (isNaN(result)) {
      console.error('Resultado não é um número válido:', result);
      return 0;
    }
    
    console.log(`Resultado do cálculo: ${result}`);
    return result;
  } catch (error) {
    console.error(`Erro ao calcular horas com fórmula ${task.hours_formula}:`, error);
    return 0;
  }
};

// Função para processar tarefas e calcular horas
export const processTasks = (tasks: Task[], attributeValues: Record<string, number> = {}) => {
  if (!tasks || tasks.length === 0) {
    console.log("Nenhuma tarefa para processar");
    return [];
  }
  
  console.log(`Processando ${tasks.length} tarefas com ${Object.keys(attributeValues).length} atributos`);
  
  return tasks.map(task => {
    // Criar uma cópia da tarefa para não alterar o original
    const processedTask = { ...task };
    
    // Se já temos calculated_hours, usar esse valor
    if (processedTask.calculated_hours !== undefined && processedTask.calculated_hours !== null) {
      return processedTask;
    }
    
    // Se temos fixed_hours, usar como calculated_hours
    if (processedTask.fixed_hours !== undefined && processedTask.fixed_hours !== null) {
      processedTask.calculated_hours = processedTask.fixed_hours;
      return processedTask;
    }
    
    // Se temos uma fórmula, calcular as horas
    if (processedTask.hours_formula && processedTask.hours_type === 'formula') {
      processedTask.calculated_hours = calculateTaskHours(processedTask, attributeValues);
      return processedTask;
    }
    
    // Se chegamos aqui, definir calculated_hours como 0
    processedTask.calculated_hours = 0;
    return processedTask;
  });
};

// Função simplificada para calcular custos a partir de uma lista de tarefas
export const calculateCosts = (taskList: Task[]) => {
  if (!taskList || taskList.length === 0) {
    return {
      totalHours: 0,
      totalCost: 0,
      averageHourlyRate: 0
    };
  }

  const costs = taskList.reduce((acc, task) => {
    const hours = task.calculated_hours ?? task.fixed_hours ?? 0;
    const hourlyRate = task.owner && teamRates[task.owner as keyof typeof teamRates] ? 
                      teamRates[task.owner as keyof typeof teamRates] : 0;
    const taskCost = hourlyRate * hours;
    
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
