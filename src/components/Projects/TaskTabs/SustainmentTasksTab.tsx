
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks } from "../utils/taskCalculations";
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
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree'); // Iniciar com árvore

  useEffect(() => {
    if (!tasks.length) return;
    
    const sustainmentTasks = tasks.filter(task => 
      task.epic?.toLowerCase().startsWith('sustentação') ||
      task.epic?.toLowerCase().startsWith('sustentacao') ||
      task.epic?.toLowerCase().includes('atendimento ao consumidor') ||
      task.epic?.toLowerCase().includes('sac 4.0') ||
      task.epic?.toLowerCase().includes('faturamento e gestao') ||
      task.epic?.toLowerCase().includes('faturamento e gestão')
    );
    
    // Log detalhado para debug
    console.log("Atributos para cálculos em Sustentação:", attributeValues);
    console.log("Tarefas de sustentação antes do processamento:", sustainmentTasks.length);
    
    // Processar as tarefas para calcular as horas
    const processedTasks = processTasks(sustainmentTasks, attributeValues);
    
    // Log detalhado das tarefas processadas
    console.log("Tarefas de sustentação processadas:", processedTasks.length);
    if (processedTasks.length > 0) {
      console.log("Exemplo de tarefa processada:", processedTasks[0]);
      console.log("Horas calculadas nas tarefas:", processedTasks.map(t => 
        ({ id: t.id, nome: t.task_name, horas: t.calculated_hours, owner: t.owner })));
    }
    
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
          <div className="flex justify-end mb-4">
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
