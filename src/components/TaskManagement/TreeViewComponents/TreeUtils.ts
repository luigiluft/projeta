
import { Task } from "@/types/project";

// Interface para estrutura de árvore
interface TreeNode {
  [phase: string]: {
    phase: string;
    epicMap: Record<string, {
      epic: string;
      storyMap: Record<string, {
        story: string;
        tasks: Task[];
      }>;
    }>;
  };
}

// Função para construir a estrutura de árvore
export function buildTreeStructure(tasks: Task[]): TreeNode {
  console.log("buildTreeStructure - Construindo árvore com", tasks.length, "tarefas");
  console.log("Exemplo de tarefas na entrada:", tasks.slice(0, 3).map(t => ({
    id: t.id,
    name: t.task_name,
    calculated: t.calculated_hours,
    fixed: t.fixed_hours,
    hours_type: t.hours_type
  })));

  // Inicializar a estrutura
  const treeData: TreeNode = {};

  // Se não houver tarefas, retornar a estrutura vazia, mas válida conforme a interface
  if (tasks.length === 0) {
    return treeData;
  }

  // Organizar tarefas por fase, epic e story
  tasks.forEach((task) => {
    const phase = task.phase || "Sem Fase";
    const epic = task.epic || "Sem Epic";
    const story = task.story || "Sem Story";

    // Verificar horas da tarefa para logging
    const taskHours = task.calculated_hours !== undefined ? task.calculated_hours : 
                    (task.fixed_hours !== undefined ? task.fixed_hours : 0);
    console.log(`Tarefa na construção da árvore: ${task.task_name} - Horas: ${taskHours}`);

    // Criar fase se não existir
    if (!treeData[phase]) {
      treeData[phase] = { phase, epicMap: {} };
    }

    // Criar epic se não existir
    if (!treeData[phase].epicMap[epic]) {
      treeData[phase].epicMap[epic] = { epic, storyMap: {} };
    }

    // Criar story se não existir
    if (!treeData[phase].epicMap[epic].storyMap[story]) {
      treeData[phase].epicMap[epic].storyMap[story] = { story, tasks: [] };
    }

    // Adicionar tarefa à story
    treeData[phase].epicMap[epic].storyMap[story].tasks.push(task);
  });

  return treeData;
}

// Função para inicializar o estado de expandido
export function initializeExpanded(treeData: TreeNode): Record<string, boolean> {
  const expanded: Record<string, boolean> = {};
  
  // Expandir todas as fases por padrão
  Object.keys(treeData).forEach(phase => {
    expanded[`phase-${phase}`] = true;
    
    // Colapsar epic e story inicialmente
    Object.keys(treeData[phase].epicMap).forEach(epic => {
      expanded[`epic-${phase}-${epic}`] = false;
      
      Object.keys(treeData[phase].epicMap[epic].storyMap).forEach(story => {
        expanded[`story-${phase}-${epic}-${story}`] = false;
      });
    });
  });
  
  return expanded;
}
