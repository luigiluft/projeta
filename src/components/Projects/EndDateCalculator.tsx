
import { Task } from "@/types/project";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";

interface EndDateCalculatorProps {
  tasks: Task[];
  startDate: string | null;
  onEndDateCalculated: (date: string | null) => void;
}

export function EndDateCalculator({ 
  tasks, 
  startDate, 
  onEndDateCalculated 
}: EndDateCalculatorProps) {
  useEffect(() => {
    calculateEstimatedEndDate(tasks, startDate);
  }, [tasks, startDate]);

  const calculateEstimatedEndDate = async (tasks: Task[], startDateValue: string | null) => {
    if (!startDateValue || tasks.length === 0) {
      onEndDateCalculated(null);
      return;
    }

    try {
      const implementationTasks = tasks.filter(task => 
        !task.epic.toLowerCase().includes('sustentação') && 
        !task.epic.toLowerCase().includes('sustentacao'));
      
      if (implementationTasks.length === 0) {
        onEndDateCalculated(null);
        return;
      }

      const orderedTasks = [...implementationTasks].sort((a, b) => {
        if (a.depends_on === b.id) return 1;
        if (b.depends_on === a.id) return -1;
        return (a.order || 0) - (b.order || 0);
      });

      const startDateObj = new Date(startDateValue);
      startDateObj.setHours(9, 0, 0, 0);

      let currentDate = new Date(startDateObj);
      let latestEndDate = new Date(startDateObj);

      const taskEndDates = new Map<string, Date>();

      for (const task of orderedTasks) {
        if (task.depends_on && taskEndDates.has(task.depends_on)) {
          const dependencyEndDate = taskEndDates.get(task.depends_on)!;
          if (dependencyEndDate > currentDate) {
            currentDate = new Date(dependencyEndDate);
          }
        }

        const taskHours = task.calculated_hours || task.fixed_hours || 0;
        let workDays = Math.ceil(taskHours / 8);

        for (let i = 0; i < workDays; i++) {
          while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        taskEndDates.set(task.id, new Date(currentDate));

        if (currentDate > latestEndDate) {
          latestEndDate = new Date(currentDate);
        }
      }

      const formattedEndDate = format(latestEndDate, 'dd/MM/yyyy', { locale: ptBR });
      onEndDateCalculated(formattedEndDate);
      
    } catch (error) {
      console.error("Erro ao calcular data estimada:", error);
      onEndDateCalculated(null);
    }
  };

  return null; // This is a utility component, no UI
}
