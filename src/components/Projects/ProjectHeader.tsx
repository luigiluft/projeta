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
  return;
}