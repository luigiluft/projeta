import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { toast } from "sonner";

interface ProjectBasicInfoProps {
  form: UseFormReturn<ProjectFormValues>;
  readOnly?: boolean;
  estimatedEndDate?: string | null;
  selectedEpics?: string[];
  selectedTasks?: any[];
}

export function ProjectBasicInfo({ 
  form, 
  readOnly = false, 
  estimatedEndDate,
  selectedEpics = [],
  selectedTasks = []
}: ProjectBasicInfoProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
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
    setLoading(true);

    try {
      // Primeira data possível é hoje
      const today = new Date();
      const nextThreeMonths = addDays(today, 90);
      
      // Agrupar tarefas por cargo/responsável
      const tasksByRole = groupTasksByRole(selectedTasks);
      
      if (Object.keys(tasksByRole).length === 0) {
        // Se não há tarefas com responsáveis definidos
        setDisabledDates([]);
        setLoading(false);
        return;
      }

      const allDisabledDates: Date[] = [];
      const dateChecks: Promise<any>[] = [];
      
      // Para cada cargo, verificar disponibilidade nos próximos 90 dias
      for (const [role, tasks] of Object.entries(tasksByRole)) {
        const totalHours = tasks.reduce((sum, task) => {
          return sum + (task.calculated_hours || task.fixed_hours || 0);
        }, 0);
        
        // Verificar disponibilidade para este cargo em cada dia do período
        const checkPromise = checkRoleAvailability(role, today, nextThreeMonths, totalHours);
        dateChecks.push(checkPromise);
      }
      
      // Aguardar todas as verificações
      const results = await Promise.all(dateChecks);
      
      // Combinar todas as datas indisponíveis
      results.forEach(roleDisabledDates => {
        allDisabledDates.push(...roleDisabledDates);
      });
      
      // Remover duplicatas
      const uniqueDisabledDates = [...new Set(allDisabledDates.map(date => date.toISOString()))]
        .map(dateStr => new Date(dateStr));
      
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
      // Formatar datas para a API
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      // Buscar disponibilidade para este cargo no período
      const availability = await getAvailability(startDateStr, endDateStr, requiredHours);
      
      // Filtrar membros do cargo específico
      const roleMembers = availability.filter(member => {
        const teamMember = teamMembers.find(tm => tm.id === member.member_id);
        return teamMember?.position === role;
      });
      
      if (roleMembers.length === 0) {
        // Se não há membros deste cargo, todas as datas estão indisponíveis
        const allDates: Date[] = [];
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          allDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return allDates;
      }
      
      const disabledDates: Date[] = [];
      let currentDate = new Date(startDate);
      
      // Para cada dia no período, verificar se há capacidade suficiente
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        let hasAvailability = false;
        
        // Verificar se algum membro tem disponibilidade nesta data
        for (const member of roleMembers) {
          const dateAvailability = member.available_dates.find(d => d.date === dateStr);
          
          if (dateAvailability && dateAvailability.available_hours >= requiredHours / 20) {
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

  // Função para validar a seleção de datas
  const isDateDisabled = (date: Date) => {
    // Impedir seleção de datas passadas
    if (isBefore(date, new Date())) {
      return true;
    }
    
    // Verificar se a data está na lista de indisponíveis
    return disabledDates.some(disabledDate => 
      disabledDate.getDate() === date.getDate() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Projeto</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Digite o nome do projeto" 
                  {...field} 
                  readOnly={readOnly}
                  className={readOnly ? "bg-gray-50" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do cliente" 
                  {...field} 
                  readOnly={readOnly}
                  className={readOnly ? "bg-gray-50" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Início</FormLabel>
              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
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
                        format(field.value, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                          field.onChange(date);
                          setOpenCalendar(false);
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
                  Selecione Epics e tarefas para calcular
                </span>
              )}
            </div>
            <FormMessage />
          </FormItem>
        </div>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva o projeto" 
                className={`min-h-[100px] ${readOnly ? "bg-gray-50" : ""}`}
                {...field} 
                readOnly={readOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
