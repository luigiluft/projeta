
import { useEffect, useState } from "react";
import { Column, Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { CostsHeader } from "./CostsHeader";
import { EmptyTasks } from "./EmptyTasks";
import { processTasks, separateTasks } from "../utils/taskCalculations";
import { addBusinessDays, format, setHours, setMinutes, addHours, isAfter, max, isWeekend, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";

interface ImplementationTasksTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  attributeValues: Record<string, number>;
  projectStartDate?: string | null;
}

export function ImplementationTasksTab({ 
  tasks, 
  columns, 
  onColumnsChange, 
  attributeValues,
  projectStartDate
}: ImplementationTasksTabProps) {
  const [calculatedTasks, setCalculatedTasks] = useState<Task[]>([]);
  const [implementationColumns, setImplementationColumns] = useState<Column[]>([]);
  const { getAvailability } = useResourceAllocation();

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
    
    const { implementation } = separateTasks(tasks);
    const processedTasks = processTasks(implementation, attributeValues);
    
    // Calcular as datas das tarefas
    calculateTaskDates(processedTasks);
    
  }, [tasks, attributeValues, projectStartDate]);

  const calculateTaskDates = async (tasks: Task[]) => {
    if (!tasks.length || !projectStartDate) {
      setCalculatedTasks(tasks);
      return;
    }
    
    try {
      // Data inicial do projeto
      const startDate = new Date(projectStartDate);
      startDate.setHours(9, 0, 0, 0); // Começa às 9h
      
      // Calcular data final para verificação (3 meses à frente)
      const endDateCheck = addDays(startDate, 90);
      
      // Ordenar tarefas por dependências e ordem
      const orderedTasks = [...tasks].sort((a, b) => {
        // Priorizar por dependência primeiro
        if (a.depends_on && a.depends_on === b.id) return 1;
        if (b.depends_on && b.depends_on === a.id) return -1;
        
        // Depois por ordem se existir
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
      });
      
      // Buscar disponibilidade dos membros da equipe
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDateCheck, 'yyyy-MM-dd');
      const availability = await getAvailability(startDateStr, endDateStr);
      
      // Agrupar disponibilidade por papel
      const availabilityByRole: Record<string, any[]> = {};
      
      availability.forEach(member => {
        if (!availabilityByRole[member.position]) {
          availabilityByRole[member.position] = [];
        }
        availabilityByRole[member.position].push(member);
      });
      
      // Estrutura para rastrear a próxima data disponível por papel
      const roleNextAvailableDates: Record<string, Date> = {};
      
      // Estrutura para rastrear datas de término por tarefa (para dependências)
      const taskEndDates = new Map<string, Date>();
      
      // Calcular datas para cada tarefa
      const tasksWithDates = orderedTasks.map(task => {
        const role = task.owner;
        if (!role) {
          return {
            ...task,
            start_date: format(startDate, "yyyy-MM-dd'T'HH:mm:00"),
            end_date: format(addBusinessDays(startDate, 1), "yyyy-MM-dd'T'HH:mm:00")
          };
        }
        
        // Verificar membros disponíveis para este papel
        const roleMembers = availabilityByRole[role] || [];
        if (roleMembers.length === 0) {
          return {
            ...task,
            start_date: format(startDate, "yyyy-MM-dd'T'HH:mm:00"),
            end_date: format(addBusinessDays(startDate, 1), "yyyy-MM-dd'T'HH:mm:00")
          };
        }
        
        // Horas necessárias para a tarefa
        const taskHours = task.calculated_hours || task.fixed_hours || 0;
        
        // Determinar data de início
        let taskStartDate = roleNextAvailableDates[role] || new Date(startDate);
        
        // Verificar dependências
        if (task.depends_on && taskEndDates.has(task.depends_on)) {
          const dependencyEndDate = taskEndDates.get(task.depends_on)!;
          if (isAfter(dependencyEndDate, taskStartDate)) {
            taskStartDate = new Date(dependencyEndDate);
          }
        }
        
        // Encontrar primeiro dia útil
        while (isWeekend(taskStartDate)) {
          taskStartDate = addDays(taskStartDate, 1);
        }
        
        // Capacidade diária média dos membros do papel
        const roleCapacity = roleMembers.reduce((sum, member) => {
          // Verificar disponibilidade na data de início
          const dateStr = format(taskStartDate, 'yyyy-MM-dd');
          const dateAvailability = member.available_dates.find(d => d.date === dateStr);
          const availableHours = dateAvailability?.available_hours || 0;
          return sum + availableHours;
        }, 0) / roleMembers.length;
        
        const effectiveCapacity = Math.max(4, roleCapacity); // Mínimo 4h/dia
        
        // Calcular dias necessários
        const workDays = Math.ceil(taskHours / effectiveCapacity);
        
        // Calcular data de término
        let taskEndDate = taskStartDate;
        for (let i = 0; i < workDays; i++) {
          taskEndDate = addBusinessDays(taskEndDate, 1);
        }
        
        // Registrar data de término para dependências
        taskEndDates.set(task.id, taskEndDate);
        
        // Atualizar próxima data disponível para o papel
        roleNextAvailableDates[role] = new Date(taskEndDate);
        
        return {
          ...task,
          start_date: format(taskStartDate, "yyyy-MM-dd'T'HH:mm:00"),
          end_date: format(taskEndDate, "yyyy-MM-dd'T'HH:mm:00")
        };
      });
      
      console.log("Tarefas com datas calculadas:", tasksWithDates);
      setCalculatedTasks(tasksWithDates);
      
    } catch (error) {
      console.error("Erro ao calcular datas das tarefas:", error);
      setCalculatedTasks(tasks);
    }
  };

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
