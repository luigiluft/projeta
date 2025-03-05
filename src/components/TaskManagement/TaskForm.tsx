
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from "@/types/project";
import { useState } from "react";
import { toast } from "sonner";

interface TaskFormProps {
  onSubmit: (values: Omit<Task, "id" | "created_at">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectAttributes?: Record<string, any>;
}

export function TaskForm({ onSubmit, open, onOpenChange, projectAttributes }: TaskFormProps) {
  const { register, handleSubmit, watch, setValue, reset } = useForm<Omit<Task, "id" | "created_at">>();
  const [previewHours, setPreviewHours] = useState<number | null>(null);
  const hoursFormula = watch("hours_formula");

  const calculateHours = (formula: string) => {
    if (!projectAttributes) {
      toast.error("Atributos do projeto não disponíveis");
      return null;
    }

    try {
      // Cria uma função segura que só pode acessar os atributos do projeto
      const calculateSafe = new Function(...Object.keys(projectAttributes), `
        try {
          return ${formula};
        } catch (e) {
          return null;
        }
      `);

      const result = calculateSafe(...Object.values(projectAttributes));
      return typeof result === 'number' ? result : null;
    } catch (e) {
      console.error('Erro ao calcular fórmula:', e);
      return null;
    }
  };

  const handleFormulaChange = (formula: string) => {
    if (formula && projectAttributes) {
      const result = calculateHours(formula);
      setPreviewHours(result);
    }
  };

  const onSubmitForm = (values: Omit<Task, "id" | "created_at">) => {
    if (values.hours_formula) {
      const calculatedHours = calculateHours(values.hours_formula);
      if (calculatedHours !== null) {
        values.hours_formula = calculatedHours.toString();
      }
    }
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
            <Label htmlFor="hours_formula">Fórmula de Horas</Label>
            <Textarea 
              id="hours_formula" 
              {...register("hours_formula")}
              placeholder="Ex: ORDERS_PER_MONTH * 0.5 + SKU_COUNT * 0.1"
              onChange={(e) => handleFormulaChange(e.target.value)}
            />
            {projectAttributes && (
              <div className="text-sm text-gray-500">
                <p>Atributos disponíveis:</p>
                <ul className="list-disc pl-4">
                  {Object.keys(projectAttributes).map((attr) => (
                    <li key={attr}>{attr}: {projectAttributes[attr]}</li>
                  ))}
                </ul>
              </div>
            )}
            {previewHours !== null && (
              <p className="text-sm text-blue-600">
                Horas calculadas: {previewHours}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Responsável</Label>
            <Input id="owner" {...register("owner")} />
          </div>

          <Button type="submit">Criar Tarefa</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
