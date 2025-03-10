import { TaskList } from "@/components/TaskManagement/TaskList";
import { Column, Task } from "@/types/project";
import { useEffect, useState } from "react";

interface ScopeTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  attributeValues: Record<string, number>;
}

const teamRates = {
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

export function ScopeTab({ tasks, columns, onColumnsChange, attributeValues }: ScopeTabProps) {
  const [calculatedTasks, setCalculatedTasks] = useState<Task[]>(tasks);

  // Recalcular horas das tarefas quando os atributos mudarem
  useEffect(() => {
    if (!tasks.length) return;

    console.log("Calculando horas com atributos:", attributeValues);
    
    const updatedTasks = tasks.map(task => {
      const newTask = { ...task };
      
      // Se a tarefa tem uma fórmula de horas, calcular com base nos atributos
      if (task.hours_formula && task.hours_type !== 'fixed') {
        try {
          // Substituir atributos com valores na fórmula
          let formula = task.hours_formula;
          
          // Log para verificar a fórmula original
          console.log(`Fórmula original para tarefa ${task.task_name}:`, formula);
          
          // Substituir os atributos na fórmula
          Object.entries(attributeValues).forEach(([key, value]) => {
            // Use regex para garantir que substituímos apenas ocorrências isoladas da chave
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            formula = formula.replace(regex, value.toString());
          });
          
          // Log para verificar a fórmula após substituição
          console.log(`Fórmula após substituição:`, formula);
          
          // Implementar funções personalizadas
          // IF(condition, trueValue, falseValue)
          formula = formula.replace(/IF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/gi, 
            (match, condition, trueVal, falseVal) => {
              return `(${condition} ? ${trueVal} : ${falseVal})`;
            }
          );

          // ROUNDUP(value)
          formula = formula.replace(/ROUNDUP\s*\(\s*([^)]+)\s*\)/gi, 
            (match, value) => {
              return `Math.ceil(${value})`;
            }
          );

          // ROUNDDOWN(value)
          formula = formula.replace(/ROUNDDOWN\s*\(\s*([^)]+)\s*\)/gi, 
            (match, value) => {
              return `Math.floor(${value})`;
            }
          );

          // ROUND(value, decimals)
          formula = formula.replace(/ROUND\s*\(\s*([^,]+),\s*([^)]+)\s*\)/gi, 
            (match, value, decimals) => {
              return `(Math.round(${value} * Math.pow(10, ${decimals})) / Math.pow(10, ${decimals}))`;
            }
          );

          // SUM(value1, value2, ...)
          formula = formula.replace(/SUM\s*\(\s*([^)]+)\s*\)/gi, 
            (match, values) => {
              const valueArray = values.split(',').map(v => v.trim());
              return `(${valueArray.join(' + ')})`;
            }
          );

          // MAX(value1, value2, ...)
          formula = formula.replace(/MAX\s*\(\s*([^)]+)\s*\)/gi, 
            (match, values) => {
              const valueArray = values.split(',').map(v => v.trim());
              return `Math.max(${valueArray.join(', ')})`;
            }
          );

          // MIN(value1, value2, ...)
          formula = formula.replace(/MIN\s*\(\s*([^)]+)\s*\)/gi, 
            (match, values) => {
              const valueArray = values.split(',').map(v => v.trim());
              return `Math.min(${valueArray.join(', ')})`;
            }
          );

          console.log(`Fórmula após processamento de funções:`, formula);
          
          // Calcular o resultado da fórmula de maneira segura
          // eslint-disable-next-line no-new-func
          const calculatedHours = new Function(`return ${formula}`)();
          console.log(`Resultado do cálculo: ${calculatedHours}`);
          
          if (!isNaN(calculatedHours)) {
            newTask.calculated_hours = calculatedHours;
          } else {
            console.error('Resultado não é um número:', calculatedHours);
            newTask.calculated_hours = 0;
          }
        } catch (error) {
          console.error('Erro ao calcular fórmula:', task.hours_formula, error);
          newTask.calculated_hours = 0;
        }
      } else if (task.fixed_hours) {
        // Se for horas fixas, usar o valor fixo
        newTask.calculated_hours = task.fixed_hours;
      } else {
        newTask.calculated_hours = 0;
      }
      
      return newTask;
    });
    
    setCalculatedTasks(updatedTasks);
  }, [tasks, attributeValues]);

  const calculateCosts = () => {
    const costs = calculatedTasks.reduce((acc, task) => {
      const hourlyRate = teamRates[task.owner as keyof typeof teamRates] || 0;
      const hours = task.calculated_hours || 0;
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista de Tarefas</h3>
        <div className="space-y-1 text-right">
          <div className="text-sm text-gray-600">
            Total de Horas: {costs.totalHours.toFixed(2)}h
          </div>
          <div className="text-sm font-medium text-primary">
            Custo Total: {formatCurrency(costs.totalCost)}
          </div>
          <div className="text-xs text-gray-500">
            Média HH: {formatCurrency(costs.averageHourlyRate)}/h
          </div>
        </div>
      </div>
      
      {calculatedTasks.length > 0 ? (
        <TaskList 
          tasks={calculatedTasks} 
          columns={columns}
          onColumnsChange={onColumnsChange}
          showHoursColumn={true}
        />
      ) : (
        <div className="p-8 text-center border rounded-md bg-gray-50">
          <p className="text-muted-foreground">Selecione pelo menos um epic para visualizar as tarefas</p>
        </div>
      )}
    </div>
  );
}
