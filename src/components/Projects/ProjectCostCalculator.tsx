
import { Task } from "@/types/project";
import { useMemo } from "react";

interface ProjectCostCalculatorProps {
  tasks: Task[];
  onCostsCalculated: (costs: {
    totalHours: number;
    taskCosts: number;
    implTaskCosts: number;
    totalCost: number;
  }) => void;
}

// Constants moved from ProjectForm to this component
const TEAM_RATES = {
  "BK": 78.75,
  "DS": 48.13,
  "PMO": 87.50,
  "PO": 35.00,
  "CS": 48.13,
  "FRJ": 70.00,
  "FRP": 119.00,
  "BKT": 131.04,
  "ATS": 65.85,
};

const DEFAULT_PROFIT_MARGIN = 30;

export function ProjectCostCalculator({ tasks, onCostsCalculated }: ProjectCostCalculatorProps) {
  useMemo(() => {
    if (!tasks.length) {
      onCostsCalculated({
        totalHours: 0,
        taskCosts: 0,
        implTaskCosts: 0,
        totalCost: 0
      });
      return;
    }

    const implementationTasks = tasks.filter(task => 
      !task.epic.toLowerCase().includes('sustentação') && 
      !task.epic.toLowerCase().includes('sustentacao'));
    
    const implTaskCosts = implementationTasks.reduce((acc, task) => {
      const hourlyRate = TEAM_RATES[task.owner as keyof typeof TEAM_RATES] || 0;
      const hours = task.calculated_hours || (task.hours_formula ? parseFloat(task.hours_formula) : 0);
      return acc + (hourlyRate * hours);
    }, 0);
    
    const taskCosts = tasks.reduce((acc, task) => {
      const hourlyRate = TEAM_RATES[task.owner as keyof typeof TEAM_RATES] || 0;
      const hours = task.calculated_hours || (task.hours_formula ? parseFloat(task.hours_formula) : 0);
      return acc + (hourlyRate * hours);
    }, 0);

    const totalHours = tasks.reduce((sum, task) => {
      const hours = task.calculated_hours || (task.hours_formula ? parseFloat(task.hours_formula) : 0);
      return sum + hours;
    }, 0);

    const totalCost = taskCosts * (1 + DEFAULT_PROFIT_MARGIN / 100);

    onCostsCalculated({
      totalHours,
      taskCosts,
      implTaskCosts,
      totalCost
    });
  }, [tasks, onCostsCalculated]);

  return null; // This is a utility component with no UI
}
