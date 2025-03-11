
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disableBefore?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disableBefore,
  disabled = false,
  className
}: DatePickerProps) {
  const today = new Date();
  
  const disabledDays = (date: Date) => {
    // Desabilitar datas antes de hoje
    if (date < today && date.getDate() !== today.getDate()) {
      return true;
    }
    
    // Desabilitar datas antes da data especificada
    if (disableBefore) {
      const beforeDate = new Date(disableBefore);
      if (date < beforeDate && date.getDate() !== beforeDate.getDate()) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(new Date(value), "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
            }
          }}
          disabled={disabledDays}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
