
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";

interface ProjectDatesProps {
  form: UseFormReturn<ProjectFormValues>;
  selectedTasks: any[];
  estimatedEndDate?: string | null;
  readOnly?: boolean;
}

export function ProjectDates({ 
  form, 
  selectedTasks = [],
  estimatedEndDate,
  readOnly = false
}: ProjectDatesProps) {
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const { teamMembers, getAvailability, checkingAvailability } = useResourceAllocation();

  useEffect(() => {
    if (selectedTasks.length > 0 && openCalendar) {
      checkTeamAvailability();
    }
  }, [selectedTasks, openCalendar]);

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
      
      // Apenas considerar uma data como bloqueada se TODOS os papéis estiverem indisponíveis
      const allDisabledDates = new Set<string>();
      const dateMap = new Map<string, number>();
      
      results.forEach(roleDisabledDates => {
        roleDisabledDates.forEach((date: Date) => {
          const dateStr = date.toISOString();
          dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
        });
      });
      
      // Só bloqueia a data se todos os papéis estiverem indisponíveis
      const roleCount = Object.keys(tasksByRole).length;
      dateMap.forEach((count, dateStr) => {
        if (count >= roleCount) {
          allDisabledDates.add(dateStr);
        }
      });
      
      const uniqueDisabledDates = [...allDisabledDates].map(dateStr => new Date(dateStr));
      setDisabledDates(uniqueDisabledDates);
      
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
        const teamMember = teamMembers.find(tm => tm.id === member.member_id);
        return teamMember?.position === role;
      });
      
      console.log(`Membros encontrados para ${role}:`, roleMembers.length);
      
      // Se não houver membros para o papel, não bloqueia as datas
      if (roleMembers.length === 0) {
        console.log(`Nenhum membro encontrado para ${role}`);
        return [];
      }
      
      const disabledDates: Date[] = [];
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
          disabledDates.push(new Date(currentDate));
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return disabledDates;
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade para ${role}:`, error);
      return [];
    }
  };

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, new Date())) {
      return true;
    }
    
    return disabledDates.some(disabledDate => 
      disabledDate.getDate() === date.getDate() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Datas do Projeto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Início</FormLabel>
              <Popover
                open={openCalendar}
                onOpenChange={(open) => {
                  setOpenCalendar(open);
                  if (open && selectedTasks.length === 0) {
                    toast.warning("Selecione Epics e tarefas primeiro para verificar disponibilidade");
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={readOnly || selectedTasks.length === 0}
                    >
                      {field.value ? (
                        format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0" 
                  align="start"
                >
                  {loading || checkingAvailability ? (
                    <div className="p-4 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Verificando disponibilidade...</span>
                    </div>
                  ) : (
                    <>
                      {selectedTasks.length === 0 && (
                        <div className="p-3 text-sm text-amber-600 bg-amber-50">
                          Selecione Epics e tarefas primeiro para verificar disponibilidade
                        </div>
                      )}
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, 'yyyy-MM-dd'));
                          }
                        }}
                        disabled={isDateDisabled}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </>
                  )}
                </PopoverContent>
              </Popover>
              {disabledDates.length > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  Algumas datas estão bloqueadas devido a indisponibilidade da equipe.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormItem>
            <FormLabel>Data Estimada de Término</FormLabel>
            <div className="flex items-center h-10 px-3 border rounded-md bg-muted/30">
              {estimatedEndDate ? (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{estimatedEndDate}</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {selectedTasks.length > 0 
                    ? "Calculando data estimada..." 
                    : "Selecione Epics e tarefas para calcular"}
                </span>
              )}
            </div>
            <FormMessage />
          </FormItem>
        </div>
      </div>
    </div>
  );
}
