
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Task } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectTaskSelector } from "@/components/Projects/ProjectTaskSelector";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Clock, DollarSign, ChevronDown, ChevronRight, UserCircle2, CalendarDays } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function Projects() {
  const {
    projects,
    handleSubmit,
    handleDelete,
  } = useProjects();

  const [open, setOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleTasksSelected = async (tasks: Task[]) => {
    await handleSubmit(tasks);
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const handleProjectDelete = async (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      await handleDelete(projectToDelete);
      setProjectToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Projeto excluído com sucesso");
    }
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/edit/${projectId}`);
    toast.success("Editando projeto...");
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-100">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Gestão de Projetos
          </h1>
          <p className="text-sm text-gray-500">
            Visualize e gerencie seus projetos
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
            </DialogHeader>
            <ProjectTaskSelector onTasksSelected={handleTasksSelected} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const isExpanded = expandedProject === project.id;
          return (
            <Card 
              key={project.id} 
              className={`group transition-all duration-300 ${isExpanded ? 'col-span-full' : ''}`}
              onClick={() => toggleProject(project.id)}
            >
              <CardContent className="pt-6">
                <div className={`space-y-4 ${isExpanded ? 'grid grid-cols-3 gap-6' : ''}`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{project.total_hours.toFixed(1)}h</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(project.total_cost)}</span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      <div className="space-y-4 border-l pl-6">
                        <h4 className="font-medium text-gray-900">Informações do Projeto</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarDays className="h-4 w-4" />
                            <span>Criado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Badge variant="outline">{project.type}</Badge>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 border-l pl-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Tarefas</h4>
                          <Button size="sm" variant="outline" className="h-8">
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {project.tasks?.map((task) => (
                            <div 
                              key={task.id}
                              className="p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-sm">{task.task_name}</p>
                                  <p className="text-xs text-gray-500">{task.story}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <UserCircle2 className="h-3 w-3" />
                                  {task.owner}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {task.phase}
                                </Badge>
                                <span className="text-gray-600">{task.hours}h</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(project.id);
                  }}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectDelete(project.id);
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full flex items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
            <p className="text-muted-foreground">Nenhum projeto cadastrado</p>
          </div>
        )}
      </div>

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
