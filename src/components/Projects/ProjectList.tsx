
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
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectListProps {
  projects: Project[];
  onDeleteProject: (projectId: string) => void;
}

export function ProjectList({ projects, onDeleteProject }: ProjectListProps) {
  const navigate = useNavigate();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/edit/${projectId}`);
    toast.info("Redirecionando para edição do projeto");
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await onDeleteProject(projectToDelete);
        setProjectToDelete(null);
        toast.success("Projeto excluído com sucesso");
      } catch (error) {
        toast.error("Erro ao excluir projeto");
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
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
                <TableRow 
                  key={project.id} 
                  className="group hover:bg-muted/30 transition-colors"
                >
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
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div>{project.project_name}</div>
                      <div className="text-sm text-muted-foreground">{project.epic}</div>
                    </div>
                  </TableCell>
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
                        onClick={() => handleEditProject(project.id)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(project.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
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
                                  <span>Conclusão: {getEstimatedDate(project)}</span>
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
                                {project.total_hours ? formatCurrency(project.total_cost / project.total_hours) : 'R$ 0,00'}
                              </div>
                            </div>
                          </div>
                        </div>
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

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
