
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, differenceInBusinessDays, format, isWithinInterval, isSameDay, isWeekend, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, AlertTriangle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Project {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  team: string;
  progress: number;
  allocations?: { name: string; position: string }[];
}

interface ProjectTimelineProps {
  projects: Project[];
  selectedDate?: Date;
}

export function ProjectTimeline({ projects, selectedDate }: ProjectTimelineProps) {
  const today = new Date();

  const getProjectStatus = (project: Project) => {
    if (project.endDate < today) {
      if (project.progress >= 100) return "Concluído";
      return "Atrasado";
    }
    if (project.startDate > today) return "Não iniciado";
    return "Em andamento";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "text-green-600";
      case "Em andamento":
        return "text-blue-600";
      case "Atrasado":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-green-50";
      case "Em andamento":
        return "bg-blue-50";
      case "Atrasado":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const isProjectVisible = (project: Project) => {
    if (!selectedDate) return true;
    
    // Mostrar projeto se o mês selecionado estiver dentro do período ou for o mês de início ou fim
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    
    const startMonth = project.startDate.getMonth();
    const startYear = project.startDate.getFullYear();
    
    const endMonth = project.endDate.getMonth();
    const endYear = project.endDate.getFullYear();
    
    return (
      // Mesmo mês de início
      (startMonth === selectedMonth && startYear === selectedYear) ||
      // Mesmo mês de fim
      (endMonth === selectedMonth && endYear === selectedYear) ||
      // Entre mês de início e fim
      isWithinInterval(selectedDate, {
        start: new Date(startYear, startMonth, 1),
        end: new Date(endYear, endMonth + 1, 0),
      })
    );
  };

  const getDuration = (project: Project) => {
    const totalDays = differenceInDays(project.endDate, project.startDate) + 1;
    const businessDays = differenceInBusinessDays(project.endDate, project.startDate) + 1;
    
    if (totalDays <= 1) return "1 dia";
    
    return `${totalDays} dias (${businessDays} dias úteis)`;
  };

  const getRemainingDays = (project: Project) => {
    if (project.endDate < today) return "Concluído";
    if (project.startDate > today) {
      const days = differenceInDays(project.startDate, today);
      return `Inicia em ${days} dia${days !== 1 ? 's' : ''}`;
    }
    
    const days = differenceInDays(project.endDate, today);
    return `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`;
  };

  const isHighlighted = (project: Project) => {
    if (!selectedDate) return false;
    return (
      isSameDay(project.startDate, selectedDate) || 
      isSameDay(project.endDate, selectedDate) ||
      isWithinInterval(selectedDate, {
        start: project.startDate,
        end: project.endDate,
      })
    );
  };

  // Nova função para mostrar equipe alocada no projeto
  const renderTeamAllocation = (project: Project) => {
    if (!project.allocations || project.allocations.length === 0) {
      return (
        <div className="flex items-center text-amber-600 mt-1">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span className="text-sm">Sem equipe alocada</span>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <div className="flex items-center gap-1 mb-1">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Equipe alocada:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {project.allocations.slice(0, 3).map((member, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    {member.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{member.position}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {project.allocations.length > 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    +{project.allocations.length - 3}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {project.allocations.slice(3).map((member, index) => (
                      <p key={index} className="text-sm">{member.name} ({member.position})</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {projects
        .filter(isProjectVisible)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .map((project) => {
          const status = getProjectStatus(project);
          const statusColor = getStatusColor(status);
          const statusBgColor = getStatusBgColor(status);
          const highlighted = isHighlighted(project);

          return (
            <Card 
              key={project.id} 
              className={`p-4 transition-all ${
                highlighted 
                  ? 'border-blue-400 shadow-md' 
                  : 'hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{project.name}</h3>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${statusBgColor} ${statusColor}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      {project.team !== "Sem equipe" ? (
                        <span>{project.team}</span>
                      ) : (
                        <span className="text-amber-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Sem equipe alocada
                        </span>
                      )}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {getDuration(project)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500 flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Início
                      </span>
                      <span className="font-medium">
                        {format(project.startDate, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Fim
                      </span>
                      <span className="font-medium">
                        {format(project.endDate, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  {renderTeamAllocation(project)}

                  <div className="text-sm">
                    <span className={`font-medium ${
                      status === "Atrasado" ? "text-red-600" : "text-blue-600"
                    }`}>
                      {getRemainingDays(project)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

      {projects.filter(isProjectVisible).length === 0 && (
        <div className="text-center py-8">
          <p>Nenhum projeto encontrado para o período selecionado.</p>
        </div>
      )}
    </div>
  );
}
