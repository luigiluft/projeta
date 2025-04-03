
import { Task } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

interface RoleRates {
  [key: string]: number;
}

// Taxas horárias por função
const ROLE_RATES: RoleRates = {
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

// Horas fixas por cargo de responsável
const ROLE_HOURS_PER_DAY: RoleRates = {
  "BK": 6,
  "DS": 7,
  "PMO": 5,
  "PO": 6,
  "CS": 7,
  "FRJ": 7,
  "FRP": 6,
  "BKT": 5,
  "ATS": 6,
  "default": 6
};

export const useProjectCalculations = () => {
  // Função para calcular os custos do projeto com base nas tarefas e atributos
  const calculateProjectCosts = (tasks: Task[], attributeValues: Record<string, number> = {}) => {
    let totalHours = 0;
    let totalCost = 0;

    tasks.forEach(task => {
      if (task.hours_formula) {
        try {
          let formula = task.hours_formula;
          Object.entries(attributeValues).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            formula = formula.replace(regex, value.toString());
          });
          
          const calculatedHours = eval(formula);
          const hours = isNaN(calculatedHours) ? 0 : calculatedHours;
          
          totalHours += hours;
          const hourlyRate = ROLE_RATES[task.owner as keyof typeof ROLE_RATES] || 0;
          totalCost += hours * hourlyRate;
        } catch (error) {
          console.error('Erro ao calcular fórmula:', task.hours_formula, error);
        }
      }
    });

    const profitMargin = 30.00; // 30%
    const finalCost = totalCost * (1 + profitMargin / 100);

    return {
      baseCost: totalCost,
      totalCost: finalCost,
      totalHours,
      profitMargin
    };
  };

  // Função para estimar as datas de entrega com base nas capacidades fixas por cargo
  const estimateDeliveryDates = async (tasks: Task[], startDate: Date) => {
    // Atribuir datas às tarefas
    const tasksWithDates = tasks.map(task => {
      // Determinar a capacidade diária do responsável
      const ownerCapacity = task.owner && ROLE_HOURS_PER_DAY[task.owner] 
        ? ROLE_HOURS_PER_DAY[task.owner] 
        : ROLE_HOURS_PER_DAY.default;

      // Calcular duração em dias
      let taskHours = 0;
      
      if (task.calculated_hours) {
        taskHours = task.calculated_hours;
      } else if (task.fixed_hours) {
        taskHours = task.fixed_hours;
      }
      
      const durationDays = Math.ceil(taskHours / ownerCapacity);
      
      return {
        ...task,
        estimated_duration_days: durationDays
      };
    });
    
    return tasksWithDates;
  };

  return {
    calculateProjectCosts,
    estimateDeliveryDates,
    ROLE_RATES,
    ROLE_HOURS_PER_DAY
  };
};
