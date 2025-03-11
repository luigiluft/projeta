
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { ResourceAvailability } from "./types";
import { toast } from "sonner";

export async function getAvailability(
  startDate: string,
  endDate: string,
  requiredHours: number = 0,
  selectedMembers: string[] = []
): Promise<ResourceAvailability[]> {
  try {
    console.log(`Verificando disponibilidade de ${startDate} a ${endDate} para ${requiredHours} horas`);
    
    // Buscar membros da equipe
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .order('first_name', { ascending: true });
    
    if (teamError) throw teamError;

    // Filtrar membros se especificados
    const membersToCheck = selectedMembers.length > 0
      ? teamMembers.filter(member => selectedMembers.includes(member.id))
      : teamMembers;
    
    // Buscar alocações existentes
    const { data: existingAllocations, error: allocationsError } = await supabase
      .from('project_allocations')
      .select('*')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);
      
    if (allocationsError) throw allocationsError;
    
    console.log(`Encontradas ${existingAllocations.length} alocações no período`);
    
    // Calcular disponibilidade para cada membro
    const availability: ResourceAvailability[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (const member of membersToCheck) {
      const memberAllocations = existingAllocations.filter(
        alloc => alloc.member_id === member.id
      );
      
      console.log(`Membro ${member.first_name} tem ${memberAllocations.length} alocações`);
      
      const availableDates = [];
      let currentDate = new Date(start);
      
      while (currentDate <= end) {
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate = addDays(currentDate, 1);
          continue;
        }
        
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dailyCapacity = member.daily_capacity || 8;
        
        let allocatedHours = 0;
        
        memberAllocations.forEach(alloc => {
          const allocStart = new Date(alloc.start_date);
          const allocEnd = new Date(alloc.end_date);
          
          if (currentDate >= allocStart && currentDate <= allocEnd) {
            const allocDays = Math.ceil(
              (allocEnd.getTime() - allocStart.getTime()) / (1000 * 60 * 60 * 24)
            ) * 5/7;
            allocatedHours += alloc.allocated_hours / Math.max(1, allocDays);
          }
        });
        
        availableDates.push({
          date: dateStr,
          available_hours: Math.max(0, dailyCapacity - allocatedHours)
        });
        
        currentDate = addDays(currentDate, 1);
      }
      
      availability.push({
        member_id: member.id,
        member_name: `${member.first_name} ${member.last_name}`,
        position: member.position,
        available_dates: availableDates
      });
    }
    
    return availability.sort((a, b) => {
      const totalAvailableA = a.available_dates.reduce((sum, date) => sum + date.available_hours, 0);
      const totalAvailableB = b.available_dates.reduce((sum, date) => sum + date.available_hours, 0);
      return totalAvailableB - totalAvailableA;
    });
    
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    toast.error("Erro ao verificar disponibilidade da equipe");
    return [];
  }
}
