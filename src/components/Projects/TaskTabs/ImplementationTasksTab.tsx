
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";
import { addBusinessDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  // Adicionar colunas de data à lista de colunas
  useEffect(() => {
    const updatedColumns = [...columns];
    
    // Verificar se as colunas de data já existem
    const hasStartDateColumn = updatedColumns.some(col => col.id === 'start_date');
    const hasEndDateColumn = updatedColumns.some(col => col.id === 'end_date');
    
    // Adicionar colunas de data se não existirem
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
    
    // Garantir que as colunas de data estejam visíveis
    const finalColumns = updatedColumns.map(col => {
      if (col.id === 'start_date' || col.id === 'end_date') {
        return { ...col, visible: true };
      }
      return col;
    });
    
    setImplementationColumns(finalColumns);
    
    // Se houver mudanças, atualizar as colunas no componente pai
    if (!hasStartDateColumn || !hasEndDateColumn) {
      onColumnsChange(finalColumns);
    }
  }, [columns, onColumnsChange]);

  // Filtrar e calcular apenas tarefas de implementação
  useEffect(() => {
    if (!tasks.length) return;
    
    const { implementation } = separateTasks(tasks);
    const processedTasks = processTasks(implementation, attributeValues);
    
    // Calcular datas das tarefas
    let currentDate = new Date();
    let accumulatedDays = 0;
    
    const tasksWithDates = processedTasks.map((task) => {
      const taskHours = task.calculated_hours || task.fixed_hours || 0;
      const durationDays = Math.ceil(taskHours / 7); // 7 horas por dia
      
      const startDate = addBusinessDays(currentDate, accumulatedDays);
      const endDate = addBusinessDays(startDate, durationDays - 1);
      
      accumulatedDays += durationDays;
      
      return {
        ...task,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      };
    });
    
    setCalculatedTasks(tasksWithDates);
  }, [tasks, attributeValues]);

  return (
    <div className="space-y-4 mt-4">
      <CostsHeader tasks={calculatedTasks} title="Tarefas de Implementação" />
      
      {calculatedTasks.length > 0 ? (
        <div className="border rounded-md p-4 bg-white shadow-sm">
          <TaskList 
            tasks={calculatedTasks} 
            columns={implementationColumns}
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
