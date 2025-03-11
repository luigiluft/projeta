
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { EndDateCalculator } from "./EndDateCalculator";
import { DateSelector } from "./DateSelector";

interface ProjectDatesProps {
  form: UseFormReturn<ProjectFormValues>;
  selectedTasks: any[];
  estimatedEndDate?: string | null;
  readOnly?: boolean;
  onEndDateCalculated?: (date: string | null) => void;
}

export function ProjectDates({ 
  form, 
  selectedTasks = [],
  estimatedEndDate,
  readOnly = false,
  onEndDateCalculated
}: ProjectDatesProps) {
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null);

  // Passar a data calculada para o componente pai
  useEffect(() => {
    if (onEndDateCalculated && calculatedEndDate) {
      onEndDateCalculated(calculatedEndDate);
    }
  }, [calculatedEndDate, onEndDateCalculated]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Datas do Projeto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateSelector 
          form={form}
          selectedTasks={selectedTasks}
          readOnly={readOnly}
        />

        <div>
          <FormItem>
            <FormLabel>Data Estimada de Término</FormLabel>
            <div className="flex items-center h-10 px-3 border rounded-md bg-muted/30">
              {estimatedEndDate ? (
                <div className="flex items-center gap-2">
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
