
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
  const [implementationTasks, setImplementationTasks] = useState<Task[]>([]);
  const [sustainmentTasks, setSustainmentTasks] = useState<Task[]>([]);

  // Recalcular horas das tarefas e separá-las em implementação e sustentação
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
    
    // Separar tarefas de implementação e sustentação
    const implementation = updatedTasks.filter(task => 
      !task.epic.toLowerCase().includes('sustentação') && 
      !task.epic.toLowerCase().includes('sustentacao'));
    
    const sustainment = updatedTasks.filter(task => 
      task.epic.toLowerCase().includes('sustentação') || 
      task.epic.toLowerCase().includes('sustentacao'));
    
    setImplementationTasks(implementation);
    setSustainmentTasks(sustainment);
    
  }, [tasks, attributeValues]);

  const calculateCosts = (taskList: Task[]) => {
    const costs = taskList.reduce((acc, task) => {
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

  // Calculamos os custos para todos os tipos de tarefas
  const implementationCosts = calculateCosts(implementationTasks);
  const sustainmentCosts = calculateCosts(sustainmentTasks);
  const totalCosts = calculateCosts(calculatedTasks);

  return (
    <div className="space-y-8 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista de Tarefas</h3>
        <div className="space-y-1 text-right">
          <div className="text-sm text-gray-600">
            Total de Horas: {totalCosts.totalHours.toFixed(2)}h
          </div>
          <div className="text-sm font-medium text-primary">
            Custo Total: {formatCurrency(totalCosts.totalCost)}
          </div>
          <div className="text-xs text-gray-500">
            Média HH: {formatCurrency(totalCosts.averageHourlyRate)}/h
          </div>
        </div>
      </div>
      
      {calculatedTasks.length > 0 ? (
        <div className="space-y-6">
          {/* Seção de tarefas de implementação */}
          <div className="border rounded-md p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-base">Tarefas de Implementação</h4>
              <div className="space-y-1 text-right text-sm">
                <div className="text-gray-600">
                  Horas: {implementationCosts.totalHours.toFixed(2)}h
                </div>
                <div className="font-medium text-primary">
                  Custo: {formatCurrency(implementationCosts.totalCost)}
                </div>
              </div>
            </div>
            
            {implementationTasks.length > 0 ? (
              <TaskList 
                tasks={implementationTasks} 
                columns={columns}
                onColumnsChange={onColumnsChange}
                showHoursColumn={true}
              />
            ) : (
              <div className="p-4 text-center bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Nenhuma tarefa de implementação selecionada</p>
              </div>
            )}
          </div>
          
          {/* Seção de tarefas de sustentação */}
          <div className="border rounded-md p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-base">Tarefas de Sustentação</h4>
              <div className="space-y-1 text-right text-sm">
                <div className="text-gray-600">
                  Horas: {sustainmentCosts.totalHours.toFixed(2)}h
                </div>
                <div className="font-medium text-primary">
                  Custo: {formatCurrency(sustainmentCosts.totalCost)}
                </div>
              </div>
            </div>
            
            {sustainmentTasks.length > 0 ? (
              <TaskList 
                tasks={sustainmentTasks} 
                columns={columns}
                onColumnsChange={onColumnsChange}
                showHoursColumn={true}
              />
            ) : (
              <div className="p-4 text-center bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Nenhuma tarefa de sustentação selecionada</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border rounded-md bg-gray-50">
          <p className="text-muted-foreground">Selecione pelo menos um epic para visualizar as tarefas</p>
        </div>
      )}
    </div>
  );
}
