
import { Task } from "@/types/project";

export type TaskTreeNode = {
  task: Task;
  children: TaskTreeNode[];
};

export type TreeStructure = Record<string, { 
  phase: string, 
  epicMap: Record<string, { 
    epic: string, 
    storyMap: Record<string, { 
      story: string, 
      tasks: Task[] 
    }> 
  }> 
}>;

// Construir a estrutura em árvore
export const buildTreeStructure = (tasks: Task[]) => {
  const phaseMap: TreeStructure = {};

  // Organizar as tarefas em uma estrutura hierárquica
  tasks.forEach(task => {
    const phase = task.phase || 'Sem Fase';
    const epic = task.epic || 'Sem Epic';
    const story = task.story || 'Sem Story';

    if (!phaseMap[phase]) {
      phaseMap[phase] = { phase, epicMap: {} };
    }

    if (!phaseMap[phase].epicMap[epic]) {
      phaseMap[phase].epicMap[epic] = { epic, storyMap: {} };
    }

    if (!phaseMap[phase].epicMap[epic].storyMap[story]) {
      phaseMap[phase].epicMap[epic].storyMap[story] = { story, tasks: [] };
    }

    phaseMap[phase].epicMap[epic].storyMap[story].tasks.push(task);
  });

  return phaseMap;
};

// Inicializa o estado de expandido para que fase, epic e story estejam abertos por padrão
export const initializeExpanded = (treeData: TreeStructure) => {
  const expanded: Record<string, boolean> = {};

  // Expandir todas as fases, epics e stories por padrão
  Object.keys(treeData).forEach(phase => {
    expanded[`phase-${phase}`] = true;
    
    Object.keys(treeData[phase].epicMap).forEach(epic => {
      expanded[`epic-${phase}-${epic}`] = true;
      
      // Expandir todas as stories por padrão
      Object.keys(treeData[phase].epicMap[epic].storyMap).forEach(story => {
        expanded[`story-${phase}-${epic}-${story}`] = true;
      });
    });
  });

  return expanded;
};
