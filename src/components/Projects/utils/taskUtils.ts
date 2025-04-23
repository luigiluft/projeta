
import { Task } from "@/types/project";
import { SUSTAINMENT_TERMS } from "./constants";

export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const isSustainmentTask = (task: Task): boolean => {
  if (!task) return false;
  
  const phase = normalizeText(task.phase || '');
  const epic = normalizeText(task.epic || '');
  
  return SUSTAINMENT_TERMS.some(term => 
    phase.includes(normalizeText(term)) || epic.includes(normalizeText(term))
  );
};

export const getTaskHours = (task: Task): number => {
  if (task.calculated_hours !== undefined && task.calculated_hours !== null) {
    return task.calculated_hours;
  }
  if (task.fixed_hours !== undefined && task.fixed_hours !== null) {
    return task.fixed_hours;
  }
  return 0;
};
