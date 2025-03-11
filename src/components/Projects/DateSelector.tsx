
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { useCalendarAvailability } from "@/hooks/resourceAllocation/useCalendarAvailability";

interface DateSelectorProps {
  form: UseFormReturn<ProjectFormValues>;
  selectedTasks: any[];
  readOnly?: boolean;
}

export function DateSelector({ 
  form, 
  selectedTasks = [],
  readOnly = false,
}: DateSelectorProps) {
  const [openCalendar, setOpenCalendar] = useState(false);
  
  const { 
    dateAvailability,
    disabledDates,
    loading,
    checkTeamAvailability,
    isDateDisabled,
    getDateClassName,
  } = useCalendarAvailability(selectedTasks);

  useEffect(() => {
    if (selectedTasks.length > 0 && openCalendar) {
      checkTeamAvailability();
    }
  }, [selectedTasks, openCalendar, checkTeamAvailability]);

  return (
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
                    format(parseISO(field.value), "dd/MM/yyyy", { locale: ptBR })
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
              <DatePickerContent 
                field={field}
                loading={loading}
                selectedTasks={selectedTasks}
                dateAvailability={dateAvailability}
                isDateDisabled={isDateDisabled}
                setOpenCalendar={setOpenCalendar}
                form={form}
              />
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
  );
}

interface DatePickerContentProps {
  field: any;
  loading: boolean;
  selectedTasks: any[];
  dateAvailability: Map<string, any>;
  isDateDisabled: (date: Date) => boolean;
  setOpenCalendar: (open: boolean) => void;
  form: UseFormReturn<ProjectFormValues>;
}

function DatePickerContent({
  field,
  loading,
  selectedTasks,
  dateAvailability,
  isDateDisabled,
  setOpenCalendar,
  form
}: DatePickerContentProps) {
  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2">Verificando disponibilidade...</span>
      </div>
    );
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Formatar a data para ISO string (yyyy-MM-dd)
    const isoDate = format(date, 'yyyy-MM-dd');
    
    // Usar tanto field.onChange quanto setValue para garantir que o valor seja atualizado
    field.onChange(isoDate);
    
    // Forçar a atualização do valor no formulário
    form.setValue('start_date', isoDate, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    // Fechar o calendário após a seleção
    setOpenCalendar(false);
  };

  return (
    <>
      {selectedTasks.length === 0 && (
        <div className="p-3 text-sm text-amber-600 bg-amber-50">
          Selecione Epics e tarefas primeiro para verificar disponibilidade
        </div>
      )}
      <div className="mb-2 p-3 border-b">
        <DateAvailabilityLegend />
      </div>
      <Calendar
        mode="single"
        selected={field.value ? parseISO(field.value) : undefined}
        onSelect={handleDateSelect}
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
          DayContent: (props) => <DateContent {...props} dateAvailability={dateAvailability} />
        }}
        initialFocus
        className="pointer-events-auto"
      />
    </>
  );
}

function DateAvailabilityLegend() {
  return (
    <>
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
    </>
  );
}

function DateContent({ date, dateAvailability }: { date: Date, dateAvailability: Map<string, any> }) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dateAvail = dateAvailability.get(dateStr);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center text-foreground">
      {date.getDate()}
      {dateAvail?.status === 'partial' && (
        <div className="absolute -top-0.5 -right-0.5">
          <div className="h-2 w-2 bg-amber-500 rounded-full" />
        </div>
      )}
      {dateAvail?.status === 'available' && (
        <div className="absolute -top-0.5 -right-0.5">
          <div className="h-2 w-2 bg-green-500 rounded-full" />
        </div>
      )}
    </div>
  );
}
