
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";
import { addBusinessDays, format, setHours, setMinutes, addHours, isAfter, max } from "date-fns";
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
    
    // Calcular datas das tarefas considerando dependências e um responsável por vez
    let currentDate = new Date();
    currentDate = setHours(setMinutes(currentDate, 0), 9); // Começa às 9h
    
    // Estrutura para rastrear a última data de disponibilidade de cada responsável
    const ownerAvailability: Record<string, Date> = {};
    
    // Estrutura para rastrear a data de término de cada tarefa (para dependências)
    const taskEndDates: Record<string, Date> = {};
    
    // Ordenar tarefas por ordem e dependências
    const orderedTasks = [...processedTasks].sort((a, b) => {
      // Priorizar por dependência primeiro
      if (a.depends_on === b.id) return 1;
      if (b.depends_on === a.id) return -1;
      
      // Depois por ordem se existir
      return (a.order || 0) - (b.order || 0);
    });
    
    const tasksWithDates = orderedTasks.map((task) => {
      const taskHours = task.calculated_hours || task.fixed_hours || 0;
      const hoursPerDay = 7; // Horas úteis por dia (9 às 17h com 1h almoço)
      
      // Determinar a data de início com base em:
      // 1. Data atual
      // 2. Disponibilidade do responsável
      // 3. Conclusão de tarefas dependentes
      let startDate = new Date(currentDate);
      
      // Verificar disponibilidade do responsável
      if (task.owner && ownerAvailability[task.owner]) {
        startDate = new Date(ownerAvailability[task.owner]);
      }
      
      // Verificar dependência
      if (task.depends_on && taskEndDates[task.depends_on]) {
        const dependencyEndDate = new Date(taskEndDates[task.depends_on]);
        
        // Usar a data maior entre a disponibilidade do responsável e o término da dependência
        if (isAfter(dependencyEndDate, startDate)) {
          startDate = dependencyEndDate;
        }
      }
      
      // Ajustar para começar em um horário de trabalho (9h)
      if (startDate.getHours() >= 17) {
        // Se for após o horário de trabalho, começar no próximo dia útil
        startDate = addBusinessDays(startDate, 1);
        startDate = setHours(setMinutes(startDate, 0), 9);
      } else if (startDate.getHours() !== 9 || startDate.getMinutes() !== 0) {
        // Ajustar para 9h do mesmo dia se estiver em horário de trabalho mas não às 9h
        startDate = setHours(setMinutes(startDate, 0), 9);
      }
      
      // Determinar em quantos dias a tarefa será completada
      const durationDays = Math.ceil(taskHours / hoursPerDay);
      
      // Calcular horário de término
      let endDate;
      
      // Ajustar para o horário de almoço (12h às 13h)
      if (taskHours <= 3) {
        // Se a tarefa tem menos de 3h, termina antes do almoço
        endDate = new Date(startDate);
        endDate = setHours(setMinutes(endDate, Math.round((taskHours % 1) * 60)), 9 + Math.floor(taskHours));
      } else if (taskHours <= 7) {
        // Se a tarefa tem entre 3h e 7h, considerar 1h de almoço
        endDate = new Date(startDate);
        endDate = setHours(setMinutes(endDate, Math.round((taskHours % 1) * 60)), 10 + Math.floor(taskHours)); // +1h pelo almoço
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
        endDate = setHours(setMinutes(endDate, Math.round((remainingHours % 1) * 60)), 9 + Math.floor(remainingHours) - 1);
      }
      
      // Atualizar disponibilidade do responsável
      if (task.owner) {
        ownerAvailability[task.owner] = endDate;
      }
      
      // Registrar data de término desta tarefa para dependências futuras
      taskEndDates[task.id] = endDate;
      
      return {
        ...task,
        start_date: format(startDate, "yyyy-MM-dd'T'HH:mm:00"),
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
