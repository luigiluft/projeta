
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";
import { TaskTreeView } from "@/components/TaskManagement/TaskTreeView";
import { ListTree, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCosts } from "./components/TaskCosts";

interface ImplementationTasksTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  attributeValues: Record<string, number>;
}

export function ImplementationTasksTab({ tasks, columns, onColumnsChange, attributeValues }: ImplementationTasksTabProps) {
  const [calculatedTasks, setCalculatedTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');
  
  // Processar tarefas de implementação e recalcular horas com base em atributos
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    
    // Separar tarefas de implementação
    const { implementation } = separateTasks(tasks);
    
    if (!implementation.length) {
      console.log("ImplementationTasksTab - Nenhuma tarefa de implementação encontrada");
      setCalculatedTasks([]);
      return;
    }
    
    console.log("ImplementationTasksTab - Processando", implementation.length, "tarefas com atributos");
    
    // Processar tarefas com valores de atributos
    const processedTasks = processTasks(implementation, attributeValues);
    setCalculatedTasks(processedTasks);
    
    console.log("ImplementationTasksTab - Tarefas processadas:", processedTasks.length);
  }, [tasks, attributeValues]);

  const toggleViewMode = (mode: 'table' | 'tree') => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-4 mt-4">
      <TaskCosts tasks={calculatedTasks} title="Tarefas de Implementação" />
      
      {calculatedTasks.length > 0 ? (
        <div className="border rounded-md p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium">
              Total de Tarefas: {calculatedTasks.length}
            </div>
            <div className="border rounded-md flex">
              <Button 
                variant={viewMode === 'table' ? "default" : "ghost"} 
                size="sm" 
                className="flex items-center gap-2 rounded-r-none"
                onClick={(e) => {
                  e.preventDefault(); // Impedir o envio de formulário
                  toggleViewMode('table');
                }}
                type="button" // Explicitamente definir como button para evitar submit
              >
                <Table className="h-4 w-4" />
                Tabela
              </Button>
              <Button 
                variant={viewMode === 'tree' ? "default" : "ghost"} 
                size="sm" 
                className="flex items-center gap-2 rounded-l-none"
                onClick={(e) => {
                  e.preventDefault(); // Impedir o envio de formulário
                  toggleViewMode('tree');
                }}
                type="button" // Explicitamente definir como button para evitar submit
              >
                <ListTree className="h-4 w-4" />
                Árvore
              </Button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <TaskList 
              tasks={calculatedTasks}
              columns={columns}
              onColumnsChange={onColumnsChange}
              showHoursColumn={true}
            />
          ) : (
            <TaskTreeView 
              tasks={calculatedTasks} 
            />
          )}
        </div>
      ) : (
        <EmptyTasks message="Nenhuma tarefa de implementação selecionada" />
      )}
    </div>
  );
}
