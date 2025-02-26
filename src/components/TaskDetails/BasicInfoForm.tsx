import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Task } from "@/types/project";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Variable } from "lucide-react";

interface BasicInfoFormProps {
  task: Task;
  onSubmit: (values: Task) => void;
  projectAttributes?: Record<string, any>;
}

export function BasicInfoForm({ task, onSubmit, projectAttributes }: BasicInfoFormProps) {
  const form = useForm<Task>();
  const [previewHours, setPreviewHours] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (task) {
      console.log('Resetting form with task:', task);
      form.reset({
        ...task,
        hours: task.hours || 0,
        actual_hours: task.actual_hours || 0,
      });

      if (task.hours_formula) {
        handleFormulaChange(task.hours_formula);
      }
    }
  }, [task, form]);

  const calculateHours = (formula: string) => {
    if (!projectAttributes) {
      toast.error("Atributos do projeto não disponíveis");
      return null;
    }

    try {
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
      if (result !== null) {
        form.setValue("hours", result);
      }
    }
  };

  const insertAttributeAtCursor = (attributeName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = form.getValues("hours_formula") || "";
    
    const newValue = currentValue.slice(0, start) + attributeName + currentValue.slice(end);
    form.setValue("hours_formula", newValue);
    handleFormulaChange(newValue);

    // Reposiciona o cursor após o atributo inserido
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + attributeName.length, start + attributeName.length);
    }, 0);
  };

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="hours_formula">Fórmula de Horas</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Variable className="h-4 w-4 mr-2" />
                  Inserir Variável
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white border border-gray-200"
              >
                {projectAttributes && Object.entries(projectAttributes).map(([key, value]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => insertAttributeAtCursor(key)}
                    className="flex justify-between hover:bg-blue-50"
                  >
                    <span className="font-medium">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Textarea 
            id="hours_formula" 
            ref={textareaRef}
            {...form.register("hours_formula")}
            placeholder="Ex: ordersPerMonth * 0.5 + skuCount * 0.1"
            onChange={(e) => handleFormulaChange(e.target.value)}
          />
          {previewHours !== null && (
            <p className="text-sm text-blue-600">
              Horas calculadas: {previewHours}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Horas</Label>
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
