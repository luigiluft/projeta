
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
    
    const { sustainment } = separateTasks(tasks);
    const processedTasks = processTasks(sustainment, attributeValues);
    
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
