
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Project } from "@/types/project";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

  const getEstimatedDate = (project: Project) => {
    if (project.due_date) {
      return format(new Date(project.due_date), "dd/MM/yyyy", { locale: ptBR });
    }
    // Se não houver data definida, retorna uma estimativa baseada nas horas
    const today = new Date();
    const estimatedDays = Math.ceil(project.total_hours / 8); // Assumindo 8 horas por dia
    const estimatedDate = new Date(today.setDate(today.getDate() + estimatedDays));
    return format(estimatedDate, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const isExpanded = expandedProjects.includes(project.id);
        const newTasks = project.tasks.filter(t => t.is_new === true);
        const modifiedTasks = project.tasks.filter(t => t.is_modified === true);

        return (
          <Collapsible
            key={project.id}
            open={isExpanded}
            onOpenChange={() => toggleProject(project.id)}
          >
            <Card className="group hover:shadow-lg transition-all bg-white/50 backdrop-blur-xl border border-gray-100">
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {project.name}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className="bg-primary/10 text-primary border-primary/20 text-sm"
                        >
                          {project.epic}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {project.type}
                    </Badge>
                    {project.tasks.length > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {project.tasks.length} tarefas
                      </Badge>
                    )}
                  </div>

                  <CollapsibleContent>
                    <ScrollArea className="h-[200px] mt-4 pr-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Escopo do Projeto</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {project.tasks.map(task => (
                              <li key={task.id} className="text-gray-600">
                                {task.task_name} 
                                {task.is_new && (
                                  <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 text-xs">
                                    Nova
                                  </Badge>
                                )}
                                {task.is_modified && (
                                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 text-xs">
                                    Modificada
                                  </Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {(newTasks.length > 0 || modifiedTasks.length > 0) && (
                          <div className="bg-amber-50 rounded-lg p-3 text-amber-800 text-sm">
                            <h4 className="font-medium mb-1">Alterações Recentes:</h4>
                            {newTasks.length > 0 && (
                              <p>• {newTasks.length} nova(s) tarefa(s) adicionada(s)</p>
                            )}
                            {modifiedTasks.length > 0 && (
                              <p>• {modifiedTasks.length} tarefa(s) modificada(s)</p>
                            )}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </div>
                
                <div className="flex items-center justify-between text-sm pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatHours(project.total_hours)}h estimadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Conclusão: {getEstimatedDate(project)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Collapsible>
        );
      })}
      {projects.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          Nenhum projeto cadastrado
        </div>
      )}
    </div>
  );
}
