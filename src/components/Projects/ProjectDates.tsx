
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { Badge } from "@/components/ui/badge";
import { EndDateCalculator } from "./EndDateCalculator";

interface ProjectDatesProps {
  form: UseFormReturn<ProjectFormValues>;
  selectedTasks: any[];
  estimatedEndDate?: string | null;
  readOnly?: boolean;
  onEndDateCalculated?: (date: string | null) => void;
}

// Interface para representar o status de disponibilidade de uma data
interface DateAvailability {
  date: Date;
  status: 'available' | 'partial' | 'unavailable';
}

export function ProjectDates({ 
  form, 
  selectedTasks = [],
  estimatedEndDate,
  readOnly = false,
  onEndDateCalculated
}: ProjectDatesProps) {
  const [dateAvailability, setDateAvailability] = useState<Map<string, DateAvailability>>(new Map());
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);
  const { teamMembers, getAvailability, checkingAvailability } = useResourceAllocation();

  useEffect(() => {
    if (selectedTasks.length > 0 && openCalendar) {
      checkTeamAvailability();
    }
  }, [selectedTasks, openCalendar]);

  // Passar a data calculada para o componente pai
  useEffect(() => {
    if (onEndDateCalculated && calculatedEndDate) {
      onEndDateCalculated(calculatedEndDate);
    }
  }, [calculatedEndDate, onEndDateCalculated]);

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

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      form.setValue('start_date', formattedDate);
      
      // Recalcular a data de término se temos tarefas selecionadas
      if (selectedTasks.length > 0) {
        const startDateForCalculation = new Date(formattedDate);
        startDateForCalculation.setHours(9, 0, 0, 0); // Começa às 9h
      }
    }
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
                      <div className="mb-2 p-3 border-b">
                        <div className="flex items-center space-x-2 text-sm mb-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Totalmente disponível</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm mb-1">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span>Parcialmente disponível</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>Indisponível</span>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, 'yyyy-MM-dd'));
                            handleDateChange(date);
                          }
                        }}
                        disabled={isDateDisabled}
                        modifiers={{
                          partial: (date) => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            return dateAvailability.get(dateStr)?.status === 'partial' || false;
                          }
                        }}
                        modifiersClassNames={{
                          partial: "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }}
                        components={{
                          DayContent: ({ date }) => (
                            <div className="relative w-full h-full flex items-center justify-center text-foreground">
                              {date.getDate()}
                              {(() => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const dateAvail = dateAvailability.get(dateStr);
                                
                                if (dateAvail?.status === 'partial') {
                                  return (
                                    <div className="absolute -top-0.5 -right-0.5">
                                      <AlertCircle className="h-2 w-2 text-amber-500" />
                                    </div>
                                  );
                                } else if (dateAvail?.status === 'available') {
                                  return (
                                    <div className="absolute -top-0.5 -right-0.5">
                                      <Check className="h-2 w-2 text-green-500" />
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </>
                  )}
                </PopoverContent>
              </Popover>
              {disabledDates.length > 0 && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Algumas datas estão bloqueadas devido a indisponibilidade da equipe
                  </Badge>
                </div>
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
      
      {/* Componente invisível que calcula a data estimada de término */}
      {form.watch('start_date') && selectedTasks.length > 0 && (
        <EndDateCalculator
          tasks={selectedTasks}
          startDate={form.watch('start_date')}
          onEndDateCalculated={(date) => {
            setCalculatedEndDate(date);
          }}
        />
      )}
    </div>
  );
}
