
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

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary">
              {project.epic}
            </CardTitle>
            <CardDescription>
              Criado {formatDistanceToNow(new Date(project.created_at), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total de Tarefas:</span>
                <span className="font-medium">{project.tasks.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total de Horas:</span>
                <span className="font-medium">{project.total_hours}h</span>
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
