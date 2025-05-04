
import { Task } from "@/types/project";
import { TEAM_RATES, SUSTAINMENT_TASK_ATTRIBUTES } from "./constants";
import { normalizeText, isSustainmentTask } from "./taskUtils";

export const calculateTaskHours = (task: Task, attributeValues: Record<string, any> = {}): number => {
  console.log(`Calculando horas para tarefa ${task.id} (${task.task_name})`);
  
  // Priorizar horas já calculadas
  if (task.calculated_hours !== undefined && task.calculated_hours !== null && task.calculated_hours > 0) {
    console.log(`Usando horas calculadas existentes: ${task.calculated_hours}`);
    return task.calculated_hours;
  }
  
  // Usar horas fixas se disponíveis
  if (task.fixed_hours !== undefined && task.fixed_hours !== null && task.fixed_hours > 0) {
    console.log(`Usando horas fixas: ${task.fixed_hours}`);
    return task.fixed_hours;
  }
  
  // Tentar calcular com fórmula
  if (task.hours_formula) {
    try {
      console.log(`Avaliando fórmula: ${task.hours_formula}`);
      let formula = task.hours_formula;
      
      // Verificar se temos os atributos necessários
      let allAttributesPresent = true;
      const requiredAttributes: string[] = [];
      
      // Encontrar todos os atributos necessários na fórmula
      const regex = /\b([a-zA-Z][a-zA-Z0-9_]*)\b(?!\s*\()/g;
      let match;
      while ((match = regex.exec(formula)) !== null) {
        const attributeName = match[1];
        if (attributeName !== 'Math' && !['sin', 'cos', 'tan', 'log', 'exp'].includes(attributeName)) {
          requiredAttributes.push(attributeName);
          if (attributeValues[attributeName] === undefined) {
            allAttributesPresent = false;
            console.log(`Atributo necessário não encontrado: ${attributeName}`);
          }
        }
      }
      
      console.log(`Atributos necessários para a fórmula: ${requiredAttributes.join(', ')}`);
      
      if (allAttributesPresent && requiredAttributes.length > 0) {
        // Substituir atributos na fórmula
        Object.entries(attributeValues).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            formula = formula.replace(regex, value.toString());
          }
        });
        
        console.log(`Fórmula com valores substituídos: ${formula}`);
        
        const result = eval(formula);
        if (!isNaN(result)) {
          console.log(`Resultado do cálculo via fórmula: ${result}`);
          return result;
        }
      }
    } catch (error) {
      console.error(`Erro ao calcular horas com fórmula ${task.hours_formula}:`, error);
    }
  }
  
  // Usar heurísticas para tarefas de sustentação
  if (isSustainmentTask(task)) {
    const taskNameLower = normalizeText(task.task_name);
    
    // Tentar corresponder com atributos específicos
    for (const [keyword, attributeCode] of Object.entries(SUSTAINMENT_TASK_ATTRIBUTES)) {
      if (taskNameLower.includes(normalizeText(keyword)) && 
          attributeValues[attributeCode] !== undefined && 
          attributeValues[attributeCode] !== null) {
        const hours = Number(attributeValues[attributeCode]);
        if (!isNaN(hours) && hours > 0) {
          console.log(`Usando atributo ${attributeCode} (${hours}h) para tarefa de sustentação: ${task.task_name}`);
          return hours;
        }
      }
    }
    
    // Verificar se temos o tempo de atendimento por cliente
    if (attributeValues.TEMPO_DE_ATENDIMENTO_POR_CLIENTE !== undefined && 
        attributeValues.TEMPO_DE_ATENDIMENTO_POR_CLIENTE > 0) {
      console.log(`Usando tempo de atendimento por cliente (${attributeValues.TEMPO_DE_ATENDIMENTO_POR_CLIENTE}h) para tarefa: ${task.task_name}`);
      return attributeValues.TEMPO_DE_ATENDIMENTO_POR_CLIENTE;
    }
    
    // Valor padrão para tarefas de sustentação
    console.log(`Usando valor padrão (4h) para tarefa de sustentação: ${task.task_name}`);
    return 4;
  }
  
  return 0;
};

export const calculateTaskCost = (task: Task, hours: number): number => {
  const hourlyRate = task.owner && TEAM_RATES[task.owner as keyof typeof TEAM_RATES] 
    ? TEAM_RATES[task.owner as keyof typeof TEAM_RATES] 
    : 70; // Taxa padrão
  return hourlyRate * hours;
};
