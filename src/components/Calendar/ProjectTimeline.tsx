import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, format, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Project {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  team: string;
  progress: number;
}

interface ProjectTimelineProps {
  projects: Project[];
  selectedDate?: Date;
}

export function ProjectTimeline({ projects, selectedDate }: ProjectTimelineProps) {
  const today = new Date();

  const getProjectStatus = (project: Project) => {
    if (project.endDate < today) return "Concluído";
    if (project.startDate > today) return "Não iniciado";
    return "Em andamento";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "text-green-600";
      case "Em andamento":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const isProjectVisible = (project: Project) => {
    if (!selectedDate) return true;
    return isWithinInterval(selectedDate, {
      start: project.startDate,
      end: project.endDate,
    });
  };

  const getDuration = (project: Project) => {
    const days = differenceInDays(project.endDate, project.startDate);
    return `${days} dias`;
  };

  return (
    <div className="space-y-4">
      {projects
        .filter(isProjectVisible)
        .map((project) => {
          const status = getProjectStatus(project);
          const statusColor = getStatusColor(status);

          return (
            <Card key={project.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{project.name}</h3>
                  <span className={`text-sm ${statusColor}`}>{status}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{project.team}</span>
                    <span>{getDuration(project)}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Início: {format(project.startDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <span>
                      Fim: {format(project.endDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
    </div>
  );
}