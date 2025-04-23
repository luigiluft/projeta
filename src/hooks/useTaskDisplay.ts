
import { useState, useEffect } from 'react';
import { Task } from '@/types/project';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useTaskDisplay = (tasks: Task[]) => {
  const [calculatedHoursByTask, setCalculatedHoursByTask] = useState<Record<string, number>>({});

  useEffect(() => {
    const hoursByTask: Record<string, number> = {};
    
    tasks.forEach(task => {
      const hours = task.calculated_hours ?? task.fixed_hours ?? 0;
      hoursByTask[task.id] = hours;
    });
    
    setCalculatedHoursByTask(hoursByTask);
  }, [tasks]);

  const truncateText = (text: string | undefined | null, maxLength: number = 20) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return {
    calculatedHoursByTask,
    truncateText,
    formatDate
  };
};
