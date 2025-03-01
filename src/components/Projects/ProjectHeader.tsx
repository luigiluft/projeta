
import { Button } from "@/components/ui/button";
import { Task } from "@/types/project";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProjectTaskSelector } from "./ProjectTaskSelector";

interface ProjectHeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onTasksSelected: (tasks: Task[], attributeValues: Record<string, number>) => void;
}

export function ProjectHeader({ open, setOpen, onTasksSelected }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gerencie todos os seus projetos aqui
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" asChild>
          <a href="/project-attributes">
            Gerenciar Atributos
          </a>
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          Novo Projeto
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Criar Novo Projeto</SheetTitle>
            <SheetDescription>
              Selecione as tarefas e defina os atributos para criar seu projeto
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <ProjectTaskSelector onTasksSelected={onTasksSelected} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
