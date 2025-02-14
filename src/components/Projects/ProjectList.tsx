
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Project } from "@/types/project";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="hover:shadow-lg transition-all bg-white/50 backdrop-blur-xl border border-gray-100"
        >
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {project.name}
              </CardTitle>
              <CardDescription className="text-primary font-medium">
                {project.epic}
              </CardDescription>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {project.type}
              </Badge>
              {project.tasks.length > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {project.tasks.length} tarefas
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p className="line-clamp-2">
                  Escopo: {project.tasks.map(t => t.task_name).join(", ")}
                </p>
                {project.tasks.some(t => t.is_new || t.is_modified) && (
                  <div className="text-amber-600 font-medium">
                    • Alterações recentes no escopo
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{project.total_hours}h estimadas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{project.tasks.filter(t => t.owner).length} responsáveis</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {projects.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          Nenhum projeto cadastrado
        </div>
      )}
    </div>
  );
}
