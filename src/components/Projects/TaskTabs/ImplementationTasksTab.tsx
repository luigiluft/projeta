
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

  // Adicionar colunas de data e ordem à lista de colunas
  useEffect(() => {
    const updatedColumns = [...columns];
    
    // Verificar se as colunas necessárias já existem
    const hasStartDateColumn = updatedColumns.some(col => col.id === 'start_date');
    const hasEndDateColumn = updatedColumns.some(col => col.id === 'end_date');
    const hasOrderColumn = updatedColumns.some(col => col.id === 'order');
    
    // Adicionar colunas se não existirem
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
    
    // Garantir que as colunas estejam visíveis
    const finalColumns = updatedColumns.map(col => {
      if (col.id === 'start_date' || col.id === 'end_date' || col.id === 'order') {
        return { ...col, visible: true };
      }
      return col;
    });
    
    setImplementationColumns(finalColumns);
    
    // Se houver mudanças, atualizar as colunas no componente pai
    if (!hasStartDateColumn || !hasEndDateColumn || !hasOrderColumn) {
      onColumnsChange(finalColumns);
    }
  }, [columns, onColumnsChange]);

  // Filtrar e calcular apenas tarefas de implementação
  useEffect(() => {
    if (!tasks.length) return;
    
    console.log("ImplementationTasksTab - Processando tarefas com atributos:", attributeValues);
    
    const { implementation } = separateTasks(tasks);
    const processedTasks = processTasks(implementation, attributeValues);
    
    console.log("ImplementationTasksTab - Tarefas processadas:", processedTasks.map(t => ({
      id: t.id,
      name: t.task_name,
      formula: t.hours_formula,
      calculated: t.calculated_hours
    })));
    
    // Calcular datas das tarefas considerando dependências e um responsável por vez
    let currentDate = new Date();
    currentDate = setHours(setMinutes(currentDate, 0), 9); // Começa às 9h
    
    // Ordenar tarefas por ordem e dependências
    const orderedTasks = [...processedTasks].sort((a, b) => {
      // Priorizar por dependência primeiro
      if (a.depends_on && a.depends_on === b.id) return 1;
      if (b.depends_on && b.depends_on === a.id) return -1;
      
      // Depois por ordem se existir
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
    
    // Estrutura para rastrear a última data de disponibilidade de cada responsável
    const ownerAvailability: Record<string, Date> = {};
    
    // Estrutura para rastrear a data de término de cada tarefa (para dependências)
    const taskEndDates: Record<string, Date> = {};
    
    const tasksWithDates = orderedTasks.map((task) => {
      const taskHours = task.calculated_hours || task.fixed_hours || 0;
      const hoursPerDay = 7; // Horas úteis por dia (9 às 17h com 1h almoço)
      
      // Determinar a data de início com base em:
      // 1. Data atual (se for a primeira tarefa)
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
      } else if (startDate.getHours() < 9) {
        // Se for antes do início do expediente, começar às 9h do mesmo dia
        startDate = setHours(setMinutes(startDate, 0), 9);
      }
      
      // Calcular data de término baseado nas horas da tarefa
      let endDate = new Date(startDate);
      const startHour = startDate.getHours();
      const startMinute = startDate.getMinutes();
      
      // Verificar se a tarefa atravessa o horário de almoço (12h às 13h)
      if (startHour < 12 && (startHour + taskHours) >= 12) {
        // Adicionar 1 hora ao tempo total para considerar o almoço
        endDate = addHours(endDate, taskHours + 1);
      } else {
        endDate = addHours(endDate, taskHours);
      }
      
      // Se o horário final ultrapassar 17h, ajustar para o próximo dia útil
      if (endDate.getHours() >= 17) {
        const hoursLeft = endDate.getHours() - 17 + (endDate.getMinutes() > 0 ? 1 : 0);
        
        if (hoursLeft > 0) {
          // Reajustar para 9h + horas restantes no próximo dia útil
          endDate = addBusinessDays(setHours(setMinutes(endDate, 0), 17), 1);
          endDate = setHours(endDate, 9);
          
          // Se as horas restantes atravessarem o almoço
          if (hoursLeft > 3) {
            endDate = addHours(endDate, hoursLeft + 1);
          } else {
            endDate = addHours(endDate, hoursLeft);
          }
          
          // Verificar novamente se não passou das 17h
          if (endDate.getHours() >= 17) {
            const newHoursLeft = endDate.getHours() - 17 + (endDate.getMinutes() > 0 ? 1 : 0);
            if (newHoursLeft > 0) {
              // Reajustar para 9h do próximo dia útil
              endDate = addBusinessDays(setHours(setMinutes(endDate, 0), 17), 1);
              endDate = setHours(endDate, 9);
              endDate = addHours(endDate, newHoursLeft);
            }
          }
        }
      }
      
      // Atualizar disponibilidade do responsável para esta tarefa
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
    
    console.log("Tarefas com datas calculadas:", tasksWithDates);
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
