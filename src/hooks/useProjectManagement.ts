
import { useState, useEffect } from 'react';
import { Project, Task } from '@/types/project';
import { calculateCosts, processTasks, separateTasks } from '@/components/Projects/utils/taskCalculations';

export const useProjectManagement = (epicTasks: { [key: string]: Task[] }) => {
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [estimatedEndDate, setEstimatedEndDate] = useState<string | null>(null);

  useEffect(() => {
    const tasks: Task[] = [];
    selectedEpics.forEach(epic => {
      if (epicTasks[epic]) {
        tasks.push(...epicTasks[epic]);
      }
    });
    setSelectedTasks(tasks);
  }, [selectedEpics, epicTasks]);

  const handleEpicSelectionChange = (epics: string[]) => {
    setSelectedEpics(epics);
  };

  const calculateMetrics = (tasks: Task[], attributeValues: Record<string, number>) => {
    const processedTasks = processTasks(tasks, attributeValues);
    const { sustainment, implementation } = separateTasks(processedTasks);
    const costs = calculateCosts(processedTasks);

    return {
      processedTasks,
      sustainment,
      implementation,
      costs
    };
  };

  return {
    selectedEpics,
    selectedTasks,
    estimatedEndDate,
    setEstimatedEndDate,
    handleEpicSelectionChange,
    calculateMetrics
  };
};
