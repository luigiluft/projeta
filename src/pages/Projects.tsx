
import { useState } from "react";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { ProjectList } from "@/components/Projects/ProjectList";
import { useProjects } from "@/hooks/useProjects";
import { Task } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectTaskSelector } from "@/components/Projects/ProjectTaskSelector";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Projects() {
  const {
    projects,
    handleSubmit,
    handleDelete,
    handleSaveView,
  } = useProjects();

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleTasksSelected = async (tasks: Task[]) => {
    await handleSubmit(tasks);
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const handleProjectDelete = async (projectId: string) => {
    await handleDelete(projectId);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-100">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Gestão de Projetos
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie seus projetos e visualize o total de horas por epic
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

      <div className="space-y-6">
        <ProjectList 
          projects={projects} 
          onDeleteProject={handleProjectDelete}
        />
      </div>
    </div>
  );
}
