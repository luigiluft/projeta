
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";

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

  // Filtrar e calcular apenas tarefas de sustentação
  useEffect(() => {
    if (!tasks.length) return;
    
    // Identificar tarefas de sustentação por seus epics
    const sustainmentTasks = tasks.filter(task => 
      task.epic.toLowerCase().includes('sustentação') || 
      task.epic.toLowerCase().includes('sustentacao') ||
      task.epic.toLowerCase().includes('atendimento ao consumidor') ||
      task.epic.toLowerCase().includes('sac 4.0') ||
      task.epic.toLowerCase().includes('faturamento de gestão operacional') ||
      task.epic.toLowerCase().includes('faturamento de gestao operacional')
    );
    
    const processedTasks = processTasks(sustainmentTasks, attributeValues);
    
    setCalculatedTasks(processedTasks);
  }, [tasks, attributeValues]);

  return (
    <div className="space-y-4 mt-4">
      <CostsHeader tasks={calculatedTasks} title="Tarefas de Sustentação" />
      
      {calculatedTasks.length > 0 ? (
        <div className="border rounded-md p-4 bg-white shadow-sm">
          <TaskList 
            tasks={calculatedTasks} 
            columns={columns}
            onColumnsChange={onColumnsChange}
            showHoursColumn={true}
          />
        </div>
      ) : (
        <EmptyTasks message="Nenhuma tarefa de sustentação selecionada" />
      )}
    </div>
  );
}
