
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";

interface ProjectDatesProps {
  form: UseFormReturn<ProjectFormValues>;
  readOnly?: boolean;
  estimatedEndDate: string | null;
  onStartDateChange: (date: string) => void;
  selectedTasks: any[];
}

export function ProjectDates({ 
  form, 
  readOnly, 
  estimatedEndDate, 
  onStartDateChange,
  selectedTasks 
}: ProjectDatesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Início</FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field} 
                readOnly={readOnly}
                className={readOnly ? "bg-gray-50" : ""}
                onChange={(e) => {
                  field.onChange(e);
                  if (e.target.value && selectedTasks.length > 0) {
                    onStartDateChange(e.target.value);
                  }
                }}
              />
            </FormControl>
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
  );
}
