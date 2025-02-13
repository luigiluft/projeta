
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from "@/types/project";

interface TaskFormProps {
  onSubmit: (values: Omit<Task, "id" | "created_at">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskForm({ onSubmit, open, onOpenChange }: TaskFormProps) {
  const { register, handleSubmit, reset } = useForm<Omit<Task, "id" | "created_at">>();

  const onSubmitForm = (values: Omit<Task, "id" | "created_at">) => {
    onSubmit({
      ...values,
      order_number: 0,
      is_active: true,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task_name">Nome da Tarefa</Label>
            <Input id="task_name" {...register("task_name", { required: true })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phase">Fase</Label>
            <Input id="phase" {...register("phase")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="epic">Epic</Label>
            <Input id="epic" {...register("epic")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Story</Label>
            <Input id="story" {...register("story")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Horas</Label>
            <Input 
              id="hours" 
              type="number" 
              step="0.01"
              {...register("hours", { valueAsNumber: true })} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Responsável</Label>
            <Input id="owner" {...register("owner")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependency">Dependência</Label>
            <Input id="dependency" {...register("dependency")} />
          </div>

          <Button type="submit">Criar Tarefa</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
