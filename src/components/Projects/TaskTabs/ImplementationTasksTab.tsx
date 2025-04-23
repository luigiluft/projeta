import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";
import { TaskTreeView } from "@/components/TaskManagement/TaskTreeView";
import { ListTree, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCosts } from "./components/TaskCosts";
import { 
  format, 
  setHours, 
  setMinutes, 
  addHours, 
  addBusinessDays, 
  isAfter 
} from "date-fns";

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
  const [implementationColumns, setImplementationColumns] = useState<Column[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');

  useEffect(() => {
    const updatedColumns = [...columns];
    
    const hasStartDateColumn = updatedColumns.some(col => col.id === 'start_date');
    const hasEndDateColumn = updatedColumns.some(col => col.id === 'end_date');
    const hasOrderColumn = updatedColumns.some(col => col.id === 'order');
    
    if (!hasStartDateColumn) {
      updatedColumns.push({
        id: 'start_date',
        label: 'Data Início',
        visible: true
      });
    }
    
    if (!hasEndDateColumn) {
      updatedColumns.push({
        id: 'end_date',
        label: 'Data Término',
        visible: true
      });
    }
    
    if (!hasOrderColumn) {
      updatedColumns.push({
        id: 'order',
        label: 'Ordem',
        visible: true
      });
    }
    
    const finalColumns = updatedColumns.map(col => {
      if (col.id === 'start_date' || col.id === 'end_date' || col.id === 'order') {
        return { ...col, visible: true };
      }
      return col;
    });
    
    setImplementationColumns(finalColumns);
    
    if (!hasStartDateColumn || !hasEndDateColumn || !hasOrderColumn) {
      onColumnsChange(finalColumns);
    }
  }, [columns, onColumnsChange]);

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      console.log("ImplementationTasksTab - Nenhuma tarefa para processar");
      setCalculatedTasks([]);
      return;
    }
    
    console.log("ImplementationTasksTab - Processando", tasks.length, "tarefas com atributos:", attributeValues);
    
    const { implementation } = separateTasks(tasks);
    if (!implementation || implementation.length === 0) {
      console.log("ImplementationTasksTab - Nenhuma tarefa de implementação encontrada");
      setCalculatedTasks([]);
      return;
    }
    
    const processedTasks = processTasks(implementation, attributeValues);
    
    console.log("ImplementationTasksTab - Tarefas processadas:", processedTasks.length, processedTasks.map(t => ({
      id: t.id,
      name: t.task_name,
      formula: t.hours_formula,
      calculated: t.calculated_hours
    })));
    
    let currentDate = new Date();
    currentDate = setHours(setMinutes(currentDate, 0), 9);
    
    const orderedTasks = [...processedTasks].sort((a, b) => {
      if (a.depends_on && a.depends_on === b.id) return 1;
      if (b.depends_on && b.depends_on === a.id) return -1;
      
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
    
    const ownerAvailability: Record<string, Date> = {};
    const taskEndDates: Record<string, Date> = {};
    
    const tasksWithDates = orderedTasks.map((task) => {
      const taskHours = task.calculated_hours || task.fixed_hours || 0;
      const hoursPerDay = 7;
      
      let startDate = new Date(currentDate);
      
      if (task.owner && ownerAvailability[task.owner]) {
        startDate = new Date(ownerAvailability[task.owner]);
      }
      
      if (task.depends_on && taskEndDates[task.depends_on]) {
        const dependencyEndDate = new Date(taskEndDates[task.depends_on]);
        
        if (isAfter(dependencyEndDate, startDate)) {
          startDate = dependencyEndDate;
        }
      }
      
      if (startDate.getHours() >= 17) {
        startDate = addBusinessDays(startDate, 1);
        startDate = setHours(setMinutes(startDate, 0), 9);
      } else if (startDate.getHours() < 9) {
        startDate = setHours(setMinutes(startDate, 0), 9);
      }
      
      let endDate = new Date(startDate);
      const startHour = startDate.getHours();
      const startMinute = startDate.getMinutes();
      
      if (startHour < 12 && (startHour + taskHours) >= 12) {
        endDate = addHours(endDate, taskHours + 1);
      } else {
        endDate = addHours(endDate, taskHours);
      }
      
      if (endDate.getHours() >= 17) {
        const hoursLeft = endDate.getHours() - 17 + (endDate.getMinutes() > 0 ? 1 : 0);
        
        if (hoursLeft > 0) {
          endDate = addBusinessDays(setHours(setMinutes(endDate, 0), 17), 1);
          endDate = setHours(endDate, 9);
          
          if (hoursLeft > 3) {
            endDate = addHours(endDate, hoursLeft + 1);
          } else {
            endDate = addHours(endDate, hoursLeft);
          }
          
          if (endDate.getHours() >= 17) {
            const newHoursLeft = endDate.getHours() - 17 + (endDate.getMinutes() > 0 ? 1 : 0);
            if (newHoursLeft > 0) {
              endDate = addBusinessDays(setHours(setMinutes(endDate, 0), 17), 1);
              endDate = setHours(endDate, 9);
              endDate = addHours(endDate, newHoursLeft);
            }
          }
        }
      }
      
      if (task.owner) {
        ownerAvailability[task.owner] = endDate;
      }
      
      taskEndDates[task.id] = endDate;
      
      return {
        ...task,
        start_date: format(startDate, "yyyy-MM-dd'T'HH:mm:00"),
        end_date: format(endDate, "yyyy-MM-dd'T'HH:mm:00")
      };
    });
    
    console.log("Tarefas com datas calculadas:", tasksWithDates.length);
    setCalculatedTasks(tasksWithDates);
  }, [tasks, attributeValues]);
  
  const toggleViewMode = (mode: 'table' | 'tree') => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-4 mt-4">
      <TaskCosts tasks={calculatedTasks} title="Tarefas de Implementação" />
      
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
              columns={implementationColumns}
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
