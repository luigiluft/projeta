
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectTaskListProps {
  project: Project;
}

export function ProjectTaskList({ project }: ProjectTaskListProps) {
  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

  return (
    <div className="bg-muted/50 px-6 py-4">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Escopo do Projeto</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Total: {formatHours(project.total_hours)}h</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Conclusão: {format(
                  new Date(project.due_date || new Date()),
                  "dd/MM/yyyy",
                  { locale: ptBR }
                )}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[700px] overflow-y-auto">
            {project.tasks?.map(task => (
              <div 
                key={task.id} 
                className="flex items-start justify-between bg-background rounded-lg p-4 hover:shadow-md transition-all border border-border/50"
              >
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="font-medium text-gray-900 text-lg mb-1">
                      {task.task_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {task.story}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Epic:</span>{' '}
                      <span className="text-muted-foreground">{task.epic}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fase:</span>{' '}
                      <span className="text-muted-foreground">{task.phase}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Horas:</span>{' '}
                      <span className="text-muted-foreground">{task.hours}h</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {task.is_new && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        Nova
                      </Badge>
                    )}
                    {task.is_modified && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        Modificada
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Owner: {task.owner}
                    </Badge>
                    {task.dependency && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Dependência: {task.dependency}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h5 className="font-medium text-blue-800 mb-2">Informações Adicionais</h5>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <strong>Data de Criação:</strong>{' '}
              {format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </div>
            <div>
              <strong>Média de Horas por Tarefa:</strong>{' '}
              {project.tasks?.length ? (project.total_hours / project.tasks.length).toFixed(1) : 0}h
            </div>
            <div>
              <strong>Total de Tarefas:</strong>{' '}
              {project.tasks?.length || 0}
            </div>
            <div>
              <strong>Custo Médio por Hora:</strong>{' '}
              {project.total_hours ? (project.total_cost / project.total_hours).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }) : 'R$ 0,00'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
