import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/project";

export interface AutoAllocationProps {
  projectId: string;
  tasks: Task[];
  onSuccess?: () => void;
}

export function AutoAllocation({ projectId, tasks, onSuccess }: AutoAllocationProps) {
  const [loading, setLoading] = useState(false);
  
  const handleAutoAllocate = async () => {
    try {
      setLoading(true);
      // Auto allocation logic will go here
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error in auto allocation:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A alocação automática irá tentar distribuir as tarefas do projeto entre os membros disponíveis da equipe de forma eficiente.
      </p>
      
      <div className="bg-muted/50 p-4 rounded-md">
        <h3 className="font-medium mb-2">Tarefas para alocação ({tasks.length})</h3>
        <ul className="text-sm space-y-1">
          {tasks.slice(0, 5).map(task => (
            <li key={task.id}>{task.task_name}</li>
          ))}
          {tasks.length > 5 && <li>E mais {tasks.length - 5} tarefas...</li>}
        </ul>
      </div>
      
      <Button onClick={handleAutoAllocate} disabled={loading} className="w-full">
        {loading ? "Processando..." : "Iniciar Alocação Automática"}
      </Button>
    </div>
  );
}
