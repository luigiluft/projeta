
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";
import { TaskTreeView } from "@/components/TaskManagement/TaskTreeView";
import { ListTree, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');

  useEffect(() => {
    if (!tasks.length) return;
    
    // Separar apenas as tarefas de sustentação
    const { sustainment } = separateTasks(tasks);
    
    // Processar as tarefas para calcular as horas independentemente do nome do projeto
    const processedTasks = processTasks(sustainment, attributeValues);
    
    setCalculatedTasks(processedTasks);
  }, [tasks, attributeValues]);

  // Alternar entre visualização em tabela e em árvore
  const toggleViewMode = (mode: 'table' | 'tree') => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-4 mt-4">
      <CostsHeader tasks={calculatedTasks} title="Tarefas de Sustentação" />
      
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
                onClick={() => toggleViewMode('table')}
              >
                <Table className="h-4 w-4" />
                Tabela
              </Button>
              <Button 
                variant={viewMode === 'tree' ? "default" : "ghost"} 
                size="sm" 
                className="flex items-center gap-2 rounded-l-none"
                onClick={() => toggleViewMode('tree')}
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
        <EmptyTasks message="Nenhuma tarefa de sustentação selecionada" />
      )}
    </div>
  );
}
