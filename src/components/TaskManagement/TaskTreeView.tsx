
import { useState, useEffect } from 'react';
import { Task } from "@/types/project";
import { ListTree } from "lucide-react";
import { buildTreeStructure, initializeExpanded } from './TreeViewComponents/TreeUtils';
import { PhaseGroup } from './TreeViewComponents/PhaseGroup';

interface TaskTreeViewProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  selectedTasks?: string[];
}

export function TaskTreeView({ 
  tasks, 
  onTaskSelect, 
  selectedTasks = [] 
}: TaskTreeViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Debug log para verificar as horas das tarefas
  useEffect(() => {
    console.log("TaskTreeView recebeu", tasks.length, "tarefas");
    console.log("Exemplo de tarefas recebidas:", tasks.slice(0, 5).map(t => ({
      id: t.id,
      name: t.task_name,
      calculated: t.calculated_hours,
      fixed: t.fixed_hours,
      hours_type: t.hours_type
    })));
  }, [tasks]);

  // Construir a estrutura de árvore
  const treeData = buildTreeStructure(tasks);

  // Inicializar o estado de expandido quando o componente é montado ou as tarefas mudam
  useEffect(() => {
    setExpanded(initializeExpanded(treeData));
  }, [tasks]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="overflow-y-auto border rounded-md p-2 bg-white">
      <div className="flex items-center mb-4 text-sm text-gray-500">
        <ListTree className="h-4 w-4 mr-2" />
        <span>Tarefas organizadas hierarquicamente por Fase, Epic e Story</span>
      </div>

      {Object.keys(treeData).length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-gray-500">Nenhuma tarefa encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Nível de Fase */}
          {Object.entries(treeData).map(([phase, { epicMap }]) => (
            <PhaseGroup
              key={phase}
              phase={phase}
              epicMap={epicMap}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onTaskSelect={onTaskSelect}
              selectedTasks={selectedTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
