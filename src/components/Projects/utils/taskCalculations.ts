
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

// Mapeamento de tarefas de sustentação para atributos correspondentes
const SUSTAINMENT_TASK_ATTRIBUTES: Record<string, string> = {
  "suporte técnico": "suporte_tecnico",
  "suporte na configuração": "atualizacao_de_configuracao",
  "monitoramento de bug": "monitoramento_de_bugs",
  "atualizar o conteúdo institucional": "atualizacao_de_conteudo_institucional",
  "implementar melhorias": "implementacao_de_melhorias",
  "correções de erros": "correcao_de_erros_no_front",
  "configurar e ajustar": "atualizacao_de_configuracoes_de_atendimento",
  "editar regras de negócio": "atualizacao_de_regras_de_negocio",
  "criar e gerenciar regras promocionais": "criacao_de_regras_promocionais",
  "corrigir erros relacionados a processos de integração": "correcao_de_erros_de_integracao"
};

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

// Função para calcular horas de uma tarefa com base em sua fórmula ou atributos padrão
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
  
  // Se tem fórmula definida, tenta calcular com base nela
  if (task.hours_formula) {
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
      } else {
        console.log(`Resultado do cálculo via fórmula: ${result}`);
        return result;
      }
    } catch (error) {
      console.error(`Erro ao calcular horas com fórmula ${task.hours_formula}:`, error);
    }
  }
  
  // Se chegamos aqui, não temos valores calculados, fixos ou fórmula válida
  // Vamos tentar usar atributos padrão para tarefas de sustentação
  if (isSustainmentTask(task)) {
    const taskNameLower = normalizeText(task.task_name);
    
    for (const [keyword, attributeCode] of Object.entries(SUSTAINMENT_TASK_ATTRIBUTES)) {
      if (taskNameLower.includes(normalizeText(keyword)) && attributeValues[attributeCode]) {
        const hours = Number(attributeValues[attributeCode]);
        console.log(`Usando atributo ${attributeCode} (${hours}h) para tarefa: ${task.task_name}`);
        return hours;
      }
    }
    
    // Se não encontrou por palavras-chave específicas, tenta identificar por atributos genéricos
    if (taskNameLower.includes("suporte") && attributeValues.suporte_tecnico) {
      console.log(`Usando atributo suporte_tecnico (${attributeValues.suporte_tecnico}h) para tarefa: ${task.task_name}`);
      return attributeValues.suporte_tecnico;
    }
    
    if (taskNameLower.includes("monitor") && attributeValues.monitoramento_de_bugs) {
      console.log(`Usando atributo monitoramento_de_bugs (${attributeValues.monitoramento_de_bugs}h) para tarefa: ${task.task_name}`);
      return attributeValues.monitoramento_de_bugs;
    }
    
    if (taskNameLower.includes("correc") || taskNameLower.includes("correc") || taskNameLower.includes("bug")) {
      if (attributeValues.correcao_de_erros_no_front) {
        console.log(`Usando atributo correcao_de_erros_no_front (${attributeValues.correcao_de_erros_no_front}h) para tarefa: ${task.task_name}`);
        return attributeValues.correcao_de_erros_no_front;
      }
    }
    
    if (taskNameLower.includes("integra")) {
      if (attributeValues.correcao_de_erros_de_integracao) {
        console.log(`Usando atributo correcao_de_erros_de_integracao (${attributeValues.correcao_de_erros_de_integracao}h) para tarefa: ${task.task_name}`);
        return attributeValues.correcao_de_erros_de_integracao;
      }
    }
    
    if ((taskNameLower.includes("regra") || taskNameLower.includes("promocion") || taskNameLower.includes("desconto")) && 
        attributeValues.criacao_de_regras_promocionais) {
      console.log(`Usando atributo criacao_de_regras_promocionais (${attributeValues.criacao_de_regras_promocionais}h) para tarefa: ${task.task_name}`);
      return attributeValues.criacao_de_regras_promocionais;
    }
    
    // Valor padrão para tarefas de sustentação sem atributo específico
    console.log(`Usando valor padrão (4h) para tarefa de sustentação: ${task.task_name}`);
    return 4;
  }
  
  console.log(`Nenhum cálculo aplicável para a tarefa ${task.task_name}. Retornando 0h.`);
  return 0;
};

// Função para processar tarefas e calcular horas
export const processTasks = (tasks: Task[], attributeValues: Record<string, number> = {}) => {
  if (!tasks || tasks.length === 0) {
    console.log("Nenhuma tarefa para processar");
    return [];
  }
  
  console.log(`Processando ${tasks.length} tarefas com ${Object.keys(attributeValues).length} atributos`);
  console.log("Atributos disponíveis para cálculos:", attributeValues);
  
  return tasks.map(task => {
    // Criar uma cópia da tarefa para não alterar o original
    const processedTask = { ...task };
    
    // Se já temos calculated_hours, usar esse valor
    if (processedTask.calculated_hours !== undefined && processedTask.calculated_hours !== null && processedTask.calculated_hours > 0) {
      return processedTask;
    }
    
    // Calcular as horas para a tarefa
    const calculatedHours = calculateTaskHours(processedTask, attributeValues);
    processedTask.calculated_hours = calculatedHours;
    
    console.log(`Horas calculadas para tarefa "${processedTask.task_name}": ${calculatedHours}h`);
    
    return processedTask;
  });
};

// Função para calcular custos a partir de uma lista de tarefas
export const calculateCosts = (taskList: Task[]) => {
  if (!taskList || taskList.length === 0) {
    return {
      totalHours: 0,
      totalCost: 0,
      averageHourlyRate: 0
    };
  }

  console.log(`Calculando custos para ${taskList.length} tarefas`);
  
  const costs = taskList.reduce((acc, task) => {
    const hours = task.calculated_hours ?? task.fixed_hours ?? 0;
    const hourlyRate = task.owner && teamRates[task.owner as keyof typeof teamRates] ? 
                      teamRates[task.owner as keyof typeof teamRates] : 0;
    const taskCost = hourlyRate * hours;
    
    console.log(`Tarefa "${task.task_name}": ${hours}h x R$${hourlyRate}/h = R$${taskCost}`);
    
    return {
      hours: acc.hours + hours,
      cost: acc.cost + taskCost
    };
  }, { hours: 0, cost: 0 });

  const result = {
    totalHours: costs.hours,
    totalCost: costs.cost,
    averageHourlyRate: costs.hours > 0 ? costs.cost / costs.hours : 0
  };
  
  console.log(`Resultado cálculo de custos: ${result.totalHours}h, custo R$${result.totalCost}, média R$${result.averageHourlyRate}/h`);
  
  return result;
};
