
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project } from "@/types/project";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProjectListProps {
  projects: Project[];
  onDeleteProject: (projectId: string) => void;
}

export function ProjectList({ projects, onDeleteProject }: ProjectListProps) {
  const navigate = useNavigate();
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

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getEstimatedDate = (project: Project) => {
    if (project.due_date) {
      return format(new Date(project.due_date), "dd/MM/yyyy", { locale: ptBR });
    }
    const today = new Date();
    const estimatedDays = Math.ceil(project.total_hours / 8);
    const estimatedDate = new Date(today.setDate(today.getDate() + estimatedDays));
    return format(estimatedDate, "dd/MM/yyyy", { locale: ptBR });
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/task-management/edit/${taskId}`);
    toast.info("Redirecionando para edição da tarefa");
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Projeto</TableHead>
            <TableHead>Epic</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Total Horas</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-right">Data Conclusão</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const isExpanded = expandedProjects.includes(project.id);
            return (
              <>
                <TableRow key={project.id} className="group">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleProject(project.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {project.epic}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {project.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatHours(project.total_hours)}h
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(project.total_cost)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getEstimatedDate(project)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/projects/edit/${project.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <div className="bg-muted/50 px-4 py-3">
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Escopo do Projeto</h4>
                              <div className="space-y-2">
                                {project.tasks?.map(task => (
                                  <div 
                                    key={task.id} 
                                    className="flex items-center justify-between bg-background rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="font-medium">{task.task_name}</div>
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
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <div className="text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 inline-block mr-1" />
                                        {task.hours}h
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditTask(task.id)}
                                      >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Editar
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
          {projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Nenhum projeto cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
