
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";

interface ImplementationTasksTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  attributeValues: Record<string, number>;
}

export function ImplementationTasksTab({ 
  tasks, 
  columns, 
  onColumnsChange, 
  attributeValues 
}: ImplementationTasksTabProps) {
  const [calculatedTasks, setCalculatedTasks] = useState<Task[]>([]);

  // Filtrar e calcular apenas tarefas de implementação
  useEffect(() => {
    if (!tasks.length) return;
    
    const { implementation } = separateTasks(tasks);
    const processedTasks = processTasks(implementation, attributeValues);
    
    setCalculatedTasks(processedTasks);
  }, [tasks, attributeValues]);

  return (
    <div className="space-y-4 mt-4">
      <CostsHeader tasks={calculatedTasks} title="Tarefas de Implementação" />
      
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
        <EmptyTasks message="Nenhuma tarefa de implementação selecionada" />
      )}
    </div>
  );
}
