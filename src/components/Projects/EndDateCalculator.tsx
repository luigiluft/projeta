
import { Task } from "@/types/project";
import { format, addBusinessDays, addDays, isWeekend, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";

interface EndDateCalculatorProps {
  tasks: Task[];
  startDate: string | null;
  onEndDateCalculated: (date: string | null) => void;
}

export function EndDateCalculator({ 
  tasks, 
  startDate, 
  onEndDateCalculated 
}: EndDateCalculatorProps) {
  const { getAvailability } = useResourceAllocation();
  
  useEffect(() => {
    calculateEstimatedEndDate(tasks, startDate);
  }, [tasks, startDate]);

  const calculateEstimatedEndDate = async (tasks: Task[], startDateValue: string | null) => {
    if (!startDateValue || tasks.length === 0) {
      onEndDateCalculated(null);
      return;
    }

    try {
      // Filtrar tarefas de implementação (excluir sustentação)
      const implementationTasks = tasks.filter(task => 
        !task.epic.toLowerCase().includes('sustentação') && 
        !task.epic.toLowerCase().includes('sustentacao'));
      
      if (implementationTasks.length === 0) {
        onEndDateCalculated(null);
        return;
      }

      // Ordenar tarefas por dependências e ordem
      const orderedTasks = [...implementationTasks].sort((a, b) => {
        if (a.depends_on === b.id) return 1;
        if (b.depends_on === a.id) return -1;
        return (a.order || 0) - (b.order || 0);
      });

      // Data inicial do projeto
      const projectStartDate = new Date(startDateValue);
      projectStartDate.setHours(9, 0, 0, 0); // Começa às 9h
      
      // Calcular data final do projeto (3 meses à frente para verificação de disponibilidade)
      const projectEndDateCheck = addDays(projectStartDate, 90);
      
      // Buscar disponibilidade para todos os membros da equipe
      const startDateStr = format(projectStartDate, 'yyyy-MM-dd');
      const endDateStr = format(projectEndDateCheck, 'yyyy-MM-dd');
      const availability = await getAvailability(startDateStr, endDateStr);
      
      console.log("Disponibilidade recebida para cálculo de datas:", availability);
      
      // Mapear disponibilidade por papel e membro
      const availabilityByRole: Record<string, any[]> = {};
      
      availability.forEach(member => {
        if (!availabilityByRole[member.position]) {
          availabilityByRole[member.position] = [];
        }
        availabilityByRole[member.position].push(member);
      });
      
      // Estrutura para rastrear a disponibilidade de cada papel
      const roleNextAvailableDates: Record<string, Date> = {};
      
      // Estrutura para rastrear datas de término por tarefa (para dependências)
      const taskEndDates = new Map<string, Date>();
      
      // Calcular as datas para cada tarefa
      for (const task of orderedTasks) {
        const role = task.owner;
        if (!role) continue;
        
        // Verificar membros disponíveis para este papel
        const roleMembers = availabilityByRole[role] || [];
        if (roleMembers.length === 0) continue;
        
        // Horas necessárias para a tarefa
        const taskHours = task.calculated_hours || task.fixed_hours || 0;
        
        // Determinar data de início com base em:
        // 1. Próxima data disponível para o papel
        // 2. Data final das dependências
        
        let startDate = roleNextAvailableDates[role] || new Date(projectStartDate);
        
        // Verificar dependências
        if (task.depends_on && taskEndDates.has(task.depends_on)) {
          const dependencyEndDate = taskEndDates.get(task.depends_on)!;
          if (isBefore(startDate, dependencyEndDate)) {
            startDate = new Date(dependencyEndDate);
          }
        }
        
        // Encontrar primeiro dia útil a partir da data de início
        while (isWeekend(startDate)) {
          startDate = addDays(startDate, 1);
        }
        
        // Capacidade diária (média dos membros do papel)
        const avgDailyCapacity = roleMembers.reduce((sum, member) => {
          // Verificar capacidade disponível na data de início
          const dateStr = format(startDate, 'yyyy-MM-dd');
          const dateAvailability = member.available_dates.find(d => d.date === dateStr);
          const availableHours = dateAvailability?.available_hours || 0;
          return sum + availableHours;
        }, 0) / roleMembers.length;
        
        const effectiveCapacity = Math.max(4, avgDailyCapacity); // Mínimo 4h/dia
        
        // Calcular dias necessários
        const workDays = Math.ceil(taskHours / effectiveCapacity);
        
        // Calcular data de término - adicionar dias úteis
        let endDate = startDate;
        for (let i = 0; i < workDays; i++) {
          endDate = addBusinessDays(endDate, 1);
        }
        
        // Registrar data de término
        taskEndDates.set(task.id, endDate);
        
        // Atualizar próxima data disponível para o papel
        roleNextAvailableDates[role] = new Date(endDate);
      }
      
      // Encontrar a última data de término entre todas as tarefas
      let latestEndDate = projectStartDate;
      taskEndDates.forEach(endDate => {
        if (endDate > latestEndDate) {
          latestEndDate = new Date(endDate);
        }
      });
      
      // Formatar data final estimada
      const formattedEndDate = format(latestEndDate, 'dd/MM/yyyy', { locale: ptBR });
      console.log("Data estimada de término calculada:", formattedEndDate);
      
      onEndDateCalculated(formattedEndDate);
      
    } catch (error) {
      console.error("Erro ao calcular data estimada:", error);
      onEndDateCalculated(null);
    }
  };

  return null; // Este é um componente utilitário, sem UI
}
