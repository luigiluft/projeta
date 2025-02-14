
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectTaskSelector } from "@/components/Projects/ProjectTaskSelector";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/types/project";

interface ProjectHeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onTasksSelected: (tasks: Task[]) => void;
}

export function ProjectHeader({ open, setOpen, onTasksSelected }: ProjectHeaderProps) {
  return (
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
          <ProjectTaskSelector onTasksSelected={onTasksSelected} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
