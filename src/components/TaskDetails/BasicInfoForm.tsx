
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task } from "@/types/project";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface BasicInfoFormProps {
  task: Task;
  onSubmit: (values: Task) => void;
}

export function BasicInfoForm({ task, onSubmit }: BasicInfoFormProps) {
  const form = useForm<Task>();

  useEffect(() => {
    if (task) {
      console.log('Resetting form with task:', task);
      form.reset({
        ...task,
        hours: task.hours || 0,
        actual_hours: task.actual_hours || 0,
      });
    }
  }, [task, form]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task_name">Nome da Tarefa</Label>
          <Input id="task_name" {...form.register("task_name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phase">Fase</Label>
          <Input id="phase" {...form.register("phase")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="epic">Epic</Label>
            <Input id="epic" {...form.register("epic")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="story">Story</Label>
            <Input id="story" {...form.register("story")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Horas Estimadas</Label>
            <Input 
              id="hours" 
              type="number" 
              step="0.01"
              {...form.register("hours", { valueAsNumber: true })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actual_hours">Horas Realizadas</Label>
            <Input 
              id="actual_hours" 
              type="number" 
              step="0.01"
              {...form.register("actual_hours", { valueAsNumber: true })} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">Responsável</Label>
          <Input id="owner" {...form.register("owner")} />
        </div>

        <Button type="submit">Salvar Alterações</Button>
      </form>
    </div>
  );
}
