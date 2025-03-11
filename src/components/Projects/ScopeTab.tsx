
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { calculateCosts, formatCurrency, processTasks, separateTasks } from "./utils/taskCalculations";
import { EmptyTasks } from "./TaskTabs/EmptyTasks";
import { ImplementationTasksTab } from "./TaskTabs/ImplementationTasksTab";
import { SustainmentTasksTab } from "./TaskTabs/SustainmentTasksTab";

interface ScopeTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  attributeValues: Record<string, number>;
}

export function ScopeTab({ tasks, columns, onColumnsChange, attributeValues }: ScopeTabProps) {
  const [calculatedTasks, setCalculatedTasks] = useState<Task[]>(tasks);
  const [implementationTasks, setImplementationTasks] = useState<Task[]>([]);
  const [sustainmentTasks, setSustainmentTasks] = useState<Task[]>([]);

  // Recalcular horas das tarefas e separá-las em implementação e sustentação
  useEffect(() => {
    if (!tasks.length) return;

    console.log("Calculando horas com atributos:", attributeValues);
    
    const processedTasks = processTasks(tasks, attributeValues);
    const { implementation, sustainment } = separateTasks(processedTasks);
    
    setCalculatedTasks(processedTasks);
    setImplementationTasks(implementation);
    setSustainmentTasks(sustainment);
    
  }, [tasks, attributeValues]);

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
        <>
          {/* Tab para Implementação */}
          <div className="border rounded-md p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-base">Tarefas de Implementação</h4>
              <div className="space-y-1 text-right text-sm">
                <div className="text-gray-600">
                  Horas: {calculateCosts(implementationTasks).totalHours.toFixed(2)}h
                </div>
                <div className="font-medium text-primary">
                  Custo: {formatCurrency(calculateCosts(implementationTasks).totalCost)}
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
        </>
      ) : (
        <EmptyTasks message="Selecione pelo menos um epic para visualizar as tarefas" />
      )}
    </div>
  );
}

// Exportar os componentes específicos para cada tipo de tarefa
export { ImplementationTasksTab, SustainmentTasksTab };
