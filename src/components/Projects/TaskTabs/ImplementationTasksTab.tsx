
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";
import { addBusinessDays, format, setHours, setMinutes, addHours } from "date-fns";
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
    currentDate = setHours(setMinutes(currentDate, 0), 9); // Começa às 9h
    let accumulatedDays = 0;
    
    const tasksWithDates = processedTasks.map((task) => {
      const taskHours = task.calculated_hours || task.fixed_hours || 0;
      
      // Determinar em quantos dias a tarefa será completada
      const hoursPerDay = 7; // Horas úteis por dia (9 às 17h com 1h almoço)
      const durationDays = Math.ceil(taskHours / hoursPerDay);
      
      // Data de início
      const startDate = addBusinessDays(currentDate, accumulatedDays);
      
      // Calcular horário de término no mesmo dia
      let endDate;
      let endHour = 9 + Math.floor(taskHours); // Hora base (9h + horas da tarefa)
      let endMinutes = Math.round((taskHours % 1) * 60); // Converter parte fracionária para minutos
      
      // Ajustar para o horário de almoço (12h às 13h)
      if (taskHours <= 3) {
        // Se a tarefa tem menos de 3h, termina antes do almoço
        endDate = new Date(startDate);
        endDate = setHours(setMinutes(endDate, endMinutes), 9 + Math.floor(taskHours));
      } else if (taskHours <= 7) {
        // Se a tarefa tem entre 3h e 7h, considerar 1h de almoço
        endDate = new Date(startDate);
        endDate = setHours(setMinutes(endDate, endMinutes), 10 + Math.floor(taskHours)); // +1h pelo almoço
      } else {
        // Se a tarefa durar mais de um dia
        const lastDayHours = taskHours % hoursPerDay;
        
        if (lastDayHours === 0) {
          // Se terminar exatamente no fim do dia
          endDate = addBusinessDays(startDate, durationDays - 1);
          endDate = setHours(setMinutes(endDate, 0), 17); // 17h
        } else if (lastDayHours <= 3) {
          // Último dia antes do almoço
          endDate = addBusinessDays(startDate, durationDays - 1);
          endDate = setHours(setMinutes(endDate, Math.round((lastDayHours % 1) * 60)), 9 + Math.floor(lastDayHours));
        } else {
          // Último dia após o almoço
          endDate = addBusinessDays(startDate, durationDays - 1);
          endDate = setHours(
            setMinutes(endDate, Math.round((lastDayHours % 1) * 60)), 
            10 + Math.floor(lastDayHours)
          ); // +1h pelo almoço
        }
      }
      
      // Garantir que não passe das 17h
      if (endDate.getHours() > 17 || (endDate.getHours() === 17 && endDate.getMinutes() > 0)) {
        endDate = addBusinessDays(endDate, 1);
        const remainingHours = (endDate.getHours() - 17) + (endDate.getMinutes() > 0 ? 1 : 0);
        endDate = setHours(setMinutes(endDate, endMinutes), 9 + remainingHours - 1);
      }
      
      accumulatedDays += durationDays;
      
      return {
        ...task,
        start_date: format(startDate, "yyyy-MM-dd'T'09:00:00"),
        end_date: format(endDate, "yyyy-MM-dd'T'HH:mm:00")
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
