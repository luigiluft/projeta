
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Task } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectTaskSelector } from "@/components/Projects/ProjectTaskSelector";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Clock, DollarSign, ChevronDown, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    try {
      await handleSubmit(tasks);
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Projeto criado com sucesso");
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast.error("Erro ao criar projeto");
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await handleDelete(projectToDelete);
        setProjectToDelete(null);
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast.success("Projeto excluído com sucesso");
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        toast.error("Erro ao excluir projeto");
      }
    }
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/edit/${projectId}`);
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nome do Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Horas</TableHead>
              <TableHead className="text-right">Custo Total</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <>
                <TableRow 
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleProject(project.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {expandedProject === project.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {project.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {project.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {project.total_hours.toFixed(1)}h
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      {formatCurrency(project.total_cost)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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
                    </div>
                  </TableCell>
                </TableRow>
                {expandedProject === project.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <div className="bg-muted/50 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Tarefas do Projeto</h4>
                          <Button size="sm">
                            <Plus className="h-3 w-3 mr-2" />
                            Adicionar Tarefa
                          </Button>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tarefa</TableHead>
                              <TableHead>Fase</TableHead>
                              <TableHead>História</TableHead>
                              <TableHead>Responsável</TableHead>
                              <TableHead className="text-right">Horas</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {project.tasks?.map((task) => (
                              <TableRow key={task.id}>
                                <TableCell>{task.task_name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {task.phase}
                                  </Badge>
                                </TableCell>
                                <TableCell>{task.story}</TableCell>
                                <TableCell>{task.owner}</TableCell>
                                <TableCell className="text-right">{task.hours}h</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}

            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  Nenhum projeto cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
