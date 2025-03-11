
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks } from "../utils/taskCalculations";

interface SustainmentTasksTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  attributeValues: Record<string, number>;
}

export function SustainmentTasksTab({ 
  tasks, 
  columns, 
  onColumnsChange, 
  attributeValues 
}: SustainmentTasksTabProps) {
  const [calculatedTasks, setCalculatedTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!tasks.length) return;
    
    const sustainmentTasks = tasks.filter(task => 
      task.epic.toLowerCase().startsWith('sustentação') ||
      task.epic.toLowerCase().startsWith('sustentacao') ||
      task.epic.toLowerCase().includes('atendimento ao consumidor') ||
      task.epic.toLowerCase().includes('sac 4.0') ||
      task.epic.toLowerCase().includes('faturamento e gestao') ||
      task.epic.toLowerCase().includes('faturamento e gestão') ||
      task.epic.toLowerCase().includes('faturamento de gestão operacional') ||
      task.epic.toLowerCase().includes('faturamento de gestao operacional') ||
      task.epic.toLowerCase().includes('faturamento de gestão operacional agrega') ||
      task.epic.toLowerCase().includes('faturamento de gestao operacional agrega')
    );
    
    const processedTasks = processTasks(sustainmentTasks, attributeValues);
    
    setCalculatedTasks(processedTasks);
  }, [tasks, attributeValues]);

  // Separar tarefas de custo com terceiros
  const thirdPartyCostTasks = calculatedTasks.filter(task => task.is_third_party_cost);
  const regularTasks = calculatedTasks.filter(task => !task.is_third_party_cost);

  const hasThirdPartyCosts = thirdPartyCostTasks.length > 0;

  return (
    <div className="space-y-4 mt-4">
      <CostsHeader tasks={calculatedTasks} title="Tarefas de Sustentação" />
      
      {calculatedTasks.length > 0 ? (
        <>
          {/* Exibir tarefas regulares */}
          <div className="border rounded-md p-4 bg-white shadow-sm">
            {regularTasks.length > 0 && (
              <>
                {hasThirdPartyCosts && (
                  <h4 className="font-medium mb-4">Tarefas de Horas</h4>
                )}
                <TaskList 
                  tasks={regularTasks} 
                  columns={columns}
                  onColumnsChange={onColumnsChange}
                  showHoursColumn={true}
                />
              </>
            )}
            
            {/* Exibir tarefas de custo com terceiros */}
            {hasThirdPartyCosts && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Custos com Terceiros</h4>
                <TaskList 
                  tasks={thirdPartyCostTasks} 
                  columns={columns}
                  onColumnsChange={onColumnsChange}
                  showHoursColumn={true}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyTasks message="Nenhuma tarefa de sustentação selecionada" />
      )}
    </div>
  );
}
