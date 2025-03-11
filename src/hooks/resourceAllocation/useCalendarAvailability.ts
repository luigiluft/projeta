
import { useState } from "react";
import { format, isBefore, addDays } from "date-fns";
import { useResourceAllocation } from "./useResourceAllocation";
import { toast } from "sonner";

// Interface para representar o status de disponibilidade de uma data
interface DateAvailability {
  date: Date;
  status: 'available' | 'partial' | 'unavailable';
}

export function useCalendarAvailability(selectedTasks: any[] = []) {
  const [dateAvailability, setDateAvailability] = useState<Map<string, DateAvailability>>(new Map());
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const { teamMembers, getAvailability, checkingAvailability } = useResourceAllocation();

  const groupTasksByRole = (tasks: any[]) => {
    const tasksByRole: Record<string, any[]> = {};
    
    tasks.forEach(task => {
      if (task.owner) {
        if (!tasksByRole[task.owner]) {
          tasksByRole[task.owner] = [];
        }
        tasksByRole[task.owner].push(task);
      }
    });
    
    return tasksByRole;
  };

  const checkTeamAvailability = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const nextThreeMonths = addDays(today, 90);
      
      const tasksByRole = groupTasksByRole(selectedTasks);
      
      if (Object.keys(tasksByRole).length === 0) {
        setDisabledDates([]);
        setDateAvailability(new Map());
        setLoading(false);
        return;
      }

      const dateChecks: Promise<any>[] = [];
      
      for (const [role, tasks] of Object.entries(tasksByRole)) {
        const totalHours = tasks.reduce((sum, task) => {
          return sum + (task.calculated_hours || task.fixed_hours || 0);
        }, 0);
        
        const checkPromise = checkRoleAvailability(role, today, nextThreeMonths, totalHours);
        dateChecks.push(checkPromise);
      }
      
      const results = await Promise.all(dateChecks);
      
      // Mapear disponibilidade por data
      const availabilityMap = new Map<string, {total: number, unavailable: number}>();
      const roleCount = Object.keys(tasksByRole).length;
      
      // Inicializar o mapa para todas as datas no intervalo
      let tempDate = new Date(today);
      while (tempDate <= nextThreeMonths) {
        const dateStr = format(tempDate, 'yyyy-MM-dd');
        availabilityMap.set(dateStr, {total: roleCount, unavailable: 0});
        tempDate = addDays(tempDate, 1);
      }
      
      // Contar papéis indisponíveis para cada data
      results.forEach(roleUnavailableDates => {
        roleUnavailableDates.forEach((date: Date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const current = availabilityMap.get(dateStr);
          if (current) {
            availabilityMap.set(dateStr, {
              ...current,
              unavailable: current.unavailable + 1
            });
          }
        });
      });
      
      // Converter para estrutura DateAvailability e identificar datas completamente bloqueadas
      const dateStatusMap = new Map<string, DateAvailability>();
      const completelyUnavailableDates: Date[] = [];
      
      availabilityMap.forEach((status, dateStr) => {
        const date = new Date(dateStr);
        
        if (status.unavailable === 0) {
          // Todos disponíveis
          dateStatusMap.set(dateStr, {
            date,
            status: 'available'
          });
        } else if (status.unavailable === status.total) {
          // Todos indisponíveis
          dateStatusMap.set(dateStr, {
            date,
            status: 'unavailable'
          });
          completelyUnavailableDates.push(date);
        } else {
          // Parcialmente disponível
          dateStatusMap.set(dateStr, {
            date,
            status: 'partial'
          });
        }
      });
      
      console.log("Mapa de disponibilidade:", Array.from(dateStatusMap.entries()));
      console.log("Datas completamente indisponíveis:", completelyUnavailableDates.length);
      
      setDateAvailability(dateStatusMap);
      setDisabledDates(completelyUnavailableDates);
      
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
      toast.error("Erro ao verificar disponibilidade da equipe");
    } finally {
      setLoading(false);
    }
  };

  const checkRoleAvailability = async (
    role: string, 
    startDate: Date, 
    endDate: Date, 
    requiredHours: number
  ): Promise<Date[]> => {
    try {
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      console.log(`Verificando disponibilidade para ${role} de ${startDateStr} até ${endDateStr}`);
      console.log(`Horas necessárias: ${requiredHours}`);
      
      const availability = await getAvailability(startDateStr, endDateStr, requiredHours);
      console.log("Disponibilidade recebida:", availability);
      
      const roleMembers = availability.filter(member => {
        const teamMember = teamMembers.data?.find(tm => tm.id === member.member_id);
        return teamMember?.position === role;
      });
      
      console.log(`Membros encontrados para ${role}:`, roleMembers.length);
      
      // Se não houver membros para o papel, não bloqueia as datas
      if (roleMembers.length === 0) {
        console.log(`Nenhum membro encontrado para ${role}`);
        return [];
      }
      
      const unavailableDates: Date[] = [];
      let currentDate = new Date(startDate);
      
      // Uma data só é bloqueada se NENHUM membro estiver disponível
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        let hasAvailability = false;
        
        for (const member of roleMembers) {
          const dateAvailability = member.available_dates.find(d => d.date === dateStr);
          
          // Considera disponível se tiver pelo menos 4 horas disponíveis por dia
          if (dateAvailability && dateAvailability.available_hours >= 4) {
            hasAvailability = true;
            break;
          }
        }
        
        if (!hasAvailability) {
          unavailableDates.push(new Date(currentDate));
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return unavailableDates;
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade para ${role}:`, error);
      return [];
    }
  };

  const isDateDisabled = (date: Date) => {
    // Datas no passado são sempre desabilitadas
    if (isBefore(date, new Date())) {
      return true;
    }
    
    // Verificar se a data está completamente bloqueada
    return disabledDates.some(disabledDate => 
      disabledDate.getDate() === date.getDate() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getFullYear() === date.getFullYear()
    );
  };

  const getDateClassName = (date: Date): string => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dateAvail = dateAvailability.get(dateStr);
    
    if (!dateAvail) return "";
    
    switch (dateAvail.status) {
      case 'partial':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case 'unavailable':
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return {
    dateAvailability,
    disabledDates,
    loading: loading || checkingAvailability,
    checkTeamAvailability,
    isDateDisabled,
    getDateClassName
  };
}
