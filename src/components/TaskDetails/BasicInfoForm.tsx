
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Variable } from "lucide-react";

interface BasicInfoFormProps {
  task: Task;
  onSubmit: (values: Task) => void;
  projectAttributes?: Record<string, any>;
}

export function BasicInfoForm({ task, onSubmit, projectAttributes }: BasicInfoFormProps) {
  const form = useForm<Task>();
  const [previewHours, setPreviewHours] = useState<number | null>(null);
  const [hoursType, setHoursType] = useState<string>('fixed');
  const [fixedHours, setFixedHours] = useState<number | undefined>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (task) {
      console.log('Resetting form with task:', task);
      form.reset(task);
      
      // Inicializar o tipo de horas e os valores correspondentes
      setHoursType(task.hours_type || 'fixed');
      setFixedHours(task.fixed_hours);

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
      console.log('Fórmula original:', formula);
      console.log('Atributos disponíveis:', projectAttributes);

      // Verificar se a fórmula está vazia
      if (!formula || formula.trim() === '') {
        console.log('Fórmula vazia, retornando null');
        return null;
      }

      // Primeiro substituir os atributos pelos seus valores
      let evaluableFormula = formula;
      
      // Substituir os atributos na fórmula
      Object.entries(projectAttributes).forEach(([key, value]) => {
        // Usamos uma expressão regular que corresponde à palavra exata
        const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        evaluableFormula = evaluableFormula.replace(regex, String(value));
      });

      console.log('Fórmula para avaliação:', evaluableFormula);

      // Verificar se ainda existem palavras não substituídas (exceto operadores matemáticos)
      const remainingWords = evaluableFormula.match(/[a-zA-Z_]\w*/g);
      if (remainingWords) {
        toast.error(`Atributos inválidos na fórmula: ${remainingWords.join(', ')}`);
        return null;
      }

      // Em vez de usar Function, vamos usar uma maneira mais segura de avaliar a expressão
      const safeEval = (expression: string): number => {
        // Remover qualquer coisa que não seja números, operadores matemáticos básicos e parênteses
        const sanitizedExpr = expression.replace(/[^0-9+\-*/().]/g, '');
        // Verificar se a expressão contém apenas caracteres permitidos
        if (sanitizedExpr !== expression) {
          throw new Error("Expressão contém caracteres não permitidos");
        }
        // Avaliar a expressão de maneira mais segura
        return new Function(`return ${sanitizedExpr}`)() as number;
      };

      const result = safeEval(evaluableFormula);
      
      if (typeof result !== 'number' || isNaN(result)) {
        console.error('Resultado inválido:', result);
        toast.error("A fórmula não resultou em um número válido");
        return null;
      }

      // Arredondar para 2 casas decimais
      return Math.ceil(result * 100) / 100;
    } catch (e) {
      console.error('Erro ao calcular fórmula:', e);
      toast.error("Erro ao calcular fórmula. Verifique a sintaxe.");
      return null;
    }
  };

  const handleFormulaChange = (formula: string) => {
    console.log('Formula changed to:', formula);
    form.setValue("hours_formula", formula);
    
    if (formula && projectAttributes) {
      const result = calculateHours(formula);
      setPreviewHours(result);
    }
  };

  const insertAttributeAtCursor = (attributeCode: string) => {
    const currentFormula = form.getValues("hours_formula") || "";
    
    // Apenas insere a variável, sem adicionar operadores
    const newFormula = currentFormula
      ? `${currentFormula} ${attributeCode}`
      : attributeCode;
    
    form.setValue("hours_formula", newFormula);
    handleFormulaChange(newFormula);

    // Foca o textarea após inserir a variável
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = (data: Task) => {
    console.log('Submitting form with data:', data);
    
    const formValues = {
      ...data,
      hours_type: hoursType,
      hours_formula: hoursType === 'formula' ? form.getValues("hours_formula") : undefined,
      fixed_hours: hoursType === 'fixed' ? fixedHours : undefined
    };
    
    console.log('Processed form values:', formValues);
    onSubmit(formValues);
  };

  const handleHoursTypeChange = (value: string) => {
    console.log('Hours type changed to:', value);
    setHoursType(value);
    form.setValue("hours_type", value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          <Label htmlFor="hours_type">Tipo de Horas</Label>
          <Select 
            value={hoursType} 
            onValueChange={handleHoursTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de horas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Horas Fixas</SelectItem>
              <SelectItem value="formula">Fórmula de Horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hoursType === 'fixed' ? (
          <div className="space-y-2">
            <Label htmlFor="fixed_hours">Horas Fixas</Label>
            <Input 
              id="fixed_hours" 
              type="number" 
              step="0.01"
              value={fixedHours || 0}
              onChange={(e) => setFixedHours(parseFloat(e.target.value))}
              min="0"
            />
          </div>
        ) : (
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
                  className="w-56 bg-white border border-gray-200 max-h-[300px] overflow-y-auto"
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
              value={form.watch("hours_formula") || ""}
              onChange={(e) => handleFormulaChange(e.target.value)}
              placeholder="Ex: ORDERS_PER_MONTH * 0.5 + SKU_COUNT * 0.1"
            />
            {previewHours !== null && (
              <p className="text-sm text-blue-600">
                Horas calculadas: {previewHours}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="owner">Responsável</Label>
          <Input id="owner" {...form.register("owner")} />
        </div>

        <Button type="submit">Salvar Alterações</Button>
      </form>
    </div>
  );
}
