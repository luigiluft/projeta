
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { toast } from "sonner";

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
  
  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;

    // Formatar a data para ISO string (yyyy-MM-dd)
    const isoDate = format(date, 'yyyy-MM-dd');
    
    console.log("Data selecionada:", isoDate);
    
    // Atualizar o formulário
    form.setValue('start_date', isoDate, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    // Fechar o calendário após selecionar a data
    setOpenCalendar(false);
    
    toast.success("Data de início definida com sucesso");
  };

  return (
    <FormField
      control={form.control}
      name="start_date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Data de Início</FormLabel>
          <Popover
            open={openCalendar}
            onOpenChange={setOpenCalendar}
          >
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={readOnly}
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
              <Calendar
                mode="single"
                selected={field.value ? parseISO(field.value) : undefined}
                onSelect={handleSelectDate}
                initialFocus
                disabled={(date) => {
                  // Desabilitar datas passadas
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
