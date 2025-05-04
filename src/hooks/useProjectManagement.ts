
import { useState, useEffect } from 'react';
import { Project, Task } from '@/types/project';
import { calculateCosts, processTasks, separateTasks } from '@/components/Projects/utils/taskCalculations';

export const useProjectManagement = (epicTasks: { [key: string]: Task[] }) => {
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [estimatedEndDate, setEstimatedEndDate] = useState<string | null>(null);

  // Log para debug
  console.log("useProjectManagement - Inicializado com epicTasks:", Object.keys(epicTasks));
  console.log("useProjectManagement - selectedEpics iniciais:", selectedEpics);

  useEffect(() => {
    const tasks: Task[] = [];
    
    console.log("useProjectManagement - epicTasks keys:", Object.keys(epicTasks));
    console.log("useProjectManagement - selectedEpics:", selectedEpics);
    
    if (selectedEpics.length > 0) {
      selectedEpics.forEach(epic => {
        if (epicTasks[epic]) {
          console.log(`Epic ${epic}: ${epicTasks[epic].length} tarefas encontradas`);
          tasks.push(...epicTasks[epic]);
        } else {
          console.log(`Epic ${epic}: Nenhuma tarefa encontrada`);
        }
      });
      
      console.log(`useProjectManagement - Total de tarefas selecionadas: ${tasks.length}`);
      setSelectedTasks(tasks);
    } else {
      console.log("useProjectManagement - Nenhum epic selecionado");
      setSelectedTasks([]);
    }
  }, [selectedEpics, epicTasks]);

  const handleEpicSelectionChange = (epics: string[]) => {
    console.log("useProjectManagement - Mudando epics selecionados para:", epics);
    setSelectedEpics(epics);
  };

  const calculateMetrics = (tasks: Task[], attributeValues: Record<string, number>) => {
    console.log("calculateMetrics - Processando tarefas com atributos:", attributeValues);
    const processedTasks = processTasks(tasks, attributeValues);
    const { sustainment, implementation } = separateTasks(processedTasks);
    const costs = calculateCosts(processedTasks);

    console.log("calculateMetrics - Resultados:", {
      totalTasks: processedTasks.length,
      sustainmentTasks: sustainment.length,
      implementationTasks: implementation.length,
      totalHours: costs.totalHours,
      totalCost: costs.totalCost
    });

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
    calculateMetrics,
    setSelectedEpics // Exportando esta função para permitir configuração externa
  };
};
