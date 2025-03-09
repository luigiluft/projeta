
import { Button } from "@/components/ui/button";
import { Task } from "@/types/project";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProjectTaskSelector } from "./ProjectTaskSelector";

interface ProjectHeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onTasksSelected: (tasks: Task[], attributeValues: Record<string, number>) => void;
}

export function ProjectHeader({
  open,
  setOpen,
  onTasksSelected
}: ProjectHeaderProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[90%] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle>Adicionar Projeto</SheetTitle>
          <SheetDescription>
            Selecione as tarefas para incluir neste projeto
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-8">
          <ProjectTaskSelector onTasksSelected={onTasksSelected} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
