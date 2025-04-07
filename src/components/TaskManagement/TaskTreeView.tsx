
import { useState } from 'react';
import { Task } from "@/types/project";
import { ChevronDown, ChevronRight, ListTree, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface TaskTreeViewProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  selectedTasks?: string[];
}

type TaskTreeNode = {
  task: Task;
  children: TaskTreeNode[];
};

export function TaskTreeView({ 
  tasks, 
  onTaskSelect, 
  selectedTasks = [] 
}: TaskTreeViewProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Agrupar tarefas por fase, epic e story para criar a árvore
  const buildTreeStructure = () => {
    const phaseMap: Record<string, { 
      phase: string, 
      epicMap: Record<string, { 
        epic: string, 
        storyMap: Record<string, { 
          story: string, 
          tasks: Task[] 
        }> 
      }> 
    }> = {};

    // Primeiro, organize as tarefas em uma estrutura hierárquica
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

  // Inicializar o estado de expandido para que fase e epic estejam abertos por padrão
  const initializeExpanded = () => {
    if (Object.keys(expanded).length > 0) return;

    const phaseMap = buildTreeStructure();
    const newExpanded: Record<string, boolean> = {};

    // Expandir todas as fases e epics por padrão
    Object.keys(phaseMap).forEach(phase => {
      newExpanded[`phase-${phase}`] = true;
      
      Object.keys(phaseMap[phase].epicMap).forEach(epic => {
        newExpanded[`epic-${phase}-${epic}`] = true;
      });
    });

    setExpanded(newExpanded);
  };

  // Inicializar o estado de expandido quando o componente é montado ou as tarefas mudam
  useState(() => {
    initializeExpanded();
  });

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/task-management/${taskId}`);
  };

  const handleEditTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique no botão editar propague para o clique na tarefa
    navigate(`/task-management/${taskId}`);
  };

  const handleCheckboxChange = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (onTaskSelect) {
      onTaskSelect(taskId, e.target.checked);
      e.stopPropagation();
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200"
    };
    return statusColors[status] || statusColors.pending;
  };

  const treeData = buildTreeStructure();
  // Inicializar os níveis expandidos
  initializeExpanded();

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
          {Object.values(treeData).map(({ phase, epicMap }) => (
            <div key={phase} className="border border-gray-100 rounded-md">
              <div 
                className="flex items-center p-3 bg-gray-50 cursor-pointer"
                onClick={() => toggleExpand(`phase-${phase}`)}
              >
                <div className="mr-2">
                  {expanded[`phase-${phase}`] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <div className="font-medium">{phase}</div>
                <div className="ml-2 text-sm text-gray-500">
                  ({Object.keys(epicMap).length} epics)
                </div>
              </div>
              
              {expanded[`phase-${phase}`] && (
                <div className="pl-6 pr-2 py-2 space-y-2">
                  {/* Nível de Epic */}
                  {Object.values(epicMap).map(({ epic, storyMap }) => (
                    <div key={`${phase}-${epic}`} className="border border-gray-100 rounded">
                      <div 
                        className="flex items-center p-2 bg-gray-50/50 cursor-pointer"
                        onClick={() => toggleExpand(`epic-${phase}-${epic}`)}
                      >
                        <div className="mr-2">
                          {expanded[`epic-${phase}-${epic}`] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="font-medium">{epic}</div>
                        <div className="ml-2 text-sm text-gray-500">
                          ({Object.keys(storyMap).length} stories)
                        </div>
                      </div>

                      {expanded[`epic-${phase}-${epic}`] && (
                        <div className="pl-6 pr-2 py-2 space-y-2">
                          {/* Nível de Story */}
                          {Object.values(storyMap).map(({ story, tasks: storyTasks }) => (
                            <div key={`${phase}-${epic}-${story}`} className="border border-gray-100 rounded">
                              <div 
                                className="flex items-center p-2 bg-gray-50/30 cursor-pointer"
                                onClick={() => toggleExpand(`story-${phase}-${epic}-${story}`)}
                              >
                                <div className="mr-2">
                                  {expanded[`story-${phase}-${epic}-${story}`] ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="font-medium">{story}</div>
                                <div className="ml-2 text-sm text-gray-500">
                                  ({storyTasks.length} tarefas)
                                </div>
                              </div>

                              {expanded[`story-${phase}-${epic}-${story}`] && (
                                <div className="pl-6 pr-2 py-2">
                                  {/* Lista de Tarefas */}
                                  <div className="space-y-1">
                                    {storyTasks.map(task => (
                                      <div
                                        key={task.id}
                                        className="flex flex-col p-2 hover:bg-gray-50 rounded-md cursor-pointer border border-gray-100"
                                        onClick={() => handleTaskClick(task.id)}
                                      >
                                        <div className="flex items-center mb-2">
                                          {onTaskSelect && (
                                            <input 
                                              type="checkbox"
                                              className="h-4 w-4 mr-3 text-blue-600 border-gray-300 rounded"
                                              checked={selectedTasks.includes(task.id)}
                                              onChange={(e) => handleCheckboxChange(task.id, e)}
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="font-medium">{task.task_name}</div>
                                          </div>
                                          <Badge 
                                            variant="outline" 
                                            className={`ml-2 ${getStatusBadgeColor(task.status)}`}
                                          >
                                            {task.status}
                                          </Badge>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-2"
                                            onClick={(e) => handleEditTask(task.id, e)}
                                          >
                                            <Pencil className="h-4 w-4 text-gray-500" />
                                          </Button>
                                        </div>
                                        
                                        {/* Detalhes adicionais da tarefa */}
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                          {task.owner && (
                                            <div className="flex items-center">
                                              <span className="font-medium mr-2">Responsável:</span>
                                              <span>{task.owner}</span>
                                            </div>
                                          )}
                                          
                                          {task.hours_type && (
                                            <div className="flex items-center">
                                              <span className="font-medium mr-2">Tipo de Horas:</span>
                                              <span>{task.hours_type}</span>
                                            </div>
                                          )}
                                          
                                          {(task.calculated_hours !== undefined || task.fixed_hours !== undefined) && (
                                            <div className="flex items-center">
                                              <span className="font-medium mr-2">Horas:</span>
                                              <span>{task.calculated_hours !== undefined ? task.calculated_hours : task.fixed_hours}</span>
                                            </div>
                                          )}
                                          
                                          {task.order && (
                                            <div className="flex items-center">
                                              <span className="font-medium mr-2">Ordem:</span>
                                              <span>{task.order}</span>
                                            </div>
                                          )}
                                          
                                          {task.start_date && (
                                            <div className="flex items-center">
                                              <span className="font-medium mr-2">Início:</span>
                                              <span>{new Date(task.start_date).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                          )}
                                          
                                          {task.end_date && (
                                            <div className="flex items-center">
                                              <span className="font-medium mr-2">Término:</span>
                                              <span>{new Date(task.end_date).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                          )}
                                          
                                          {task.depends_on && (
                                            <div className="flex items-center">
                                              <span className="font-medium mr-2">Depende de:</span>
                                              <span>{task.depends_on}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
