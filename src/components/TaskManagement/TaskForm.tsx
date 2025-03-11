
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
import { useState, useRef, useEffect } from "react";
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
import { Variable, CircleDollarSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface TaskFormProps {
  onSubmit: (values: Omit<Task, "id" | "created_at">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectAttributes?: Record<string, any>;
}

export function TaskForm({ onSubmit, open, onOpenChange, projectAttributes }: TaskFormProps) {
  const { register, handleSubmit, watch, setValue, reset } = useForm<Omit<Task, "id" | "created_at">>();
  const [previewHours, setPreviewHours] = useState<number | null>(null);
  const [hoursType, setHoursType] = useState<string>('fixed');
  const [fixedHours, setFixedHours] = useState<number>(0);
  const [isThirdPartyCost, setIsThirdPartyCost] = useState<boolean>(false);
  const [costAmount, setCostAmount] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resetar estado quando o diálogo fecha
  useEffect(() => {
    if (!open) {
      setIsThirdPartyCost(false);
      setCostAmount(0);
      setHoursType('fixed');
      setFixedHours(0);
      setPreviewHours(null);
      reset();
    }
  }, [open, reset]);

  const calculateHours = (formula: string) => {
    if (!projectAttributes) {
      toast.error("Atributos do projeto não disponíveis");
      return null;
    }

    try {
      console.log('Fórmula original:', formula);

      // Verificar se a fórmula está vazia
      if (!formula || formula.trim() === '') {
        return null;
      }

      // Primeiro substituir os atributos pelos seus valores
      let evaluableFormula = formula;
      
      // Substituir os atributos na fórmula
      Object.entries(projectAttributes).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        evaluableFormula = evaluableFormula.replace(regex, String(value));
      });

      console.log('Fórmula após substituição de atributos:', evaluableFormula);

      // Implementar funções personalizadas
      // IF(condition, trueValue, falseValue)
      evaluableFormula = evaluableFormula.replace(/IF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/gi, 
        (match, condition, trueVal, falseVal) => {
          return `(${condition} ? ${trueVal} : ${falseVal})`;
        }
      );

      // ROUNDUP(value)
      evaluableFormula = evaluableFormula.replace(/ROUNDUP\s*\(\s*([^)]+)\s*\)/gi, 
        (match, value) => {
          return `Math.ceil(${value})`;
        }
      );

      // ROUNDDOWN(value)
      evaluableFormula = evaluableFormula.replace(/ROUNDDOWN\s*\(\s*([^)]+)\s*\)/gi, 
        (match, value) => {
          return `Math.floor(${value})`;
        }
      );

      // ROUND(value, decimals)
      evaluableFormula = evaluableFormula.replace(/ROUND\s*\(\s*([^,]+),\s*([^)]+)\s*\)/gi, 
        (match, value, decimals) => {
          return `(Math.round(${value} * Math.pow(10, ${decimals})) / Math.pow(10, ${decimals}))`;
        }
      );

      // SUM(value1, value2, ...)
      evaluableFormula = evaluableFormula.replace(/SUM\s*\(\s*([^)]+)\s*\)/gi, 
        (match, values) => {
          const valueArray = values.split(',').map(v => v.trim());
          return `(${valueArray.join(' + ')})`;
        }
      );

      // MAX(value1, value2, ...)
      evaluableFormula = evaluableFormula.replace(/MAX\s*\(\s*([^)]+)\s*\)/gi, 
        (match, values) => {
          const valueArray = values.split(',').map(v => v.trim());
          return `Math.max(${valueArray.join(', ')})`;
        }
      );

      // MIN(value1, value2, ...)
      evaluableFormula = evaluableFormula.replace(/MIN\s*\(\s*([^)]+)\s*\)/gi, 
        (match, values) => {
          const valueArray = values.split(',').map(v => v.trim());
          return `Math.min(${valueArray.join(', ')})`;
        }
      );

      console.log('Fórmula após processamento de funções:', evaluableFormula);

      // Verificar se ainda existem palavras não substituídas (exceto operadores matemáticos e funções JavaScript reconhecidas)
      const jsGlobals = ['Math', 'ceil', 'floor', 'round', 'max', 'min', 'pow'];
      const remainingWords = evaluableFormula.match(/[a-zA-Z_]\w*/g)?.filter(word => 
        !jsGlobals.includes(word) && 
        !['true', 'false', 'null', 'undefined'].includes(word.toLowerCase())
      );
      
      if (remainingWords && remainingWords.length > 0) {
        toast.error(`Atributos ou funções inválidas na fórmula: ${remainingWords.join(', ')}`);
        return null;
      }

      // Avaliação segura da expressão final
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${evaluableFormula}`)();
      
      if (typeof result !== 'number' || isNaN(result)) {
        toast.error("A fórmula não resultou em um número válido");
        return null;
      }

      // Arredondar para 2 casas decimais
      return Math.ceil(result * 100) / 100;
    } catch (e) {
      console.error('Erro ao calcular fórmula:', e);
      toast.error(`Erro ao calcular fórmula: ${(e as Error).message}`);
      return null;
    }
  };

  const handleFormulaChange = (formula: string) => {
    if (formula && projectAttributes) {
      const result = calculateHours(formula);
      setPreviewHours(result);
    }
  };

  const insertAttributeAtCursor = (attributeCode: string) => {
    const currentFormula = watch("hours_formula") || "";
    
    // Apenas insere a variável, sem adicionar operadores
    const newFormula = currentFormula
      ? `${currentFormula} ${attributeCode}`
      : attributeCode;
    
    setValue("hours_formula", newFormula);
    handleFormulaChange(newFormula);

    // Foca o textarea após inserir a variável
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const insertFunctionTemplate = (funcName: string) => {
    let template = "";
    
    switch (funcName) {
      case "IF":
        template = "IF(condition, valueIfTrue, valueIfFalse)";
        break;
      case "ROUNDUP":
        template = "ROUNDUP(value)";
        break;
      case "ROUNDDOWN":
        template = "ROUNDDOWN(value)";
        break;
      case "ROUND":
        template = "ROUND(value, decimals)";
        break;
      case "SUM":
        template = "SUM(value1, value2, ...)";
        break;
      case "MAX":
        template = "MAX(value1, value2, ...)";
        break;
      case "MIN":
        template = "MIN(value1, value2, ...)";
        break;
      default:
        template = funcName + "()";
    }
    
    const currentFormula = watch("hours_formula") || "";
    const newFormula = currentFormula
      ? `${currentFormula} ${template}`
      : template;
    
    setValue("hours_formula", newFormula);
    
    // Foca o textarea após inserir a função
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const onSubmitForm = (values: Omit<Task, "id" | "created_at">) => {
    const formValues = {
      ...values,
      hours_type: hoursType,
      hours_formula: hoursType === 'formula' ? watch("hours_formula") : undefined,
      fixed_hours: hoursType === 'fixed' ? fixedHours : undefined,
      order_number: 0,
      is_active: true,
      is_third_party_cost: isThirdPartyCost,
      cost_amount: isThirdPartyCost ? costAmount : undefined,
    };
    
    onSubmit(formValues);
    reset();
    setHoursType('fixed');
    setFixedHours(0);
    setPreviewHours(null);
    setIsThirdPartyCost(false);
    setCostAmount(0);
  };

  // Lista de funções disponíveis
  const availableFunctions = [
    { name: "IF", description: "Condição lógica" },
    { name: "ROUNDUP", description: "Arredonda para cima" },
    { name: "ROUNDDOWN", description: "Arredonda para baixo" },
    { name: "ROUND", description: "Arredonda para X decimais" },
    { name: "SUM", description: "Soma valores" },
    { name: "MAX", description: "Valor máximo" },
    { name: "MIN", description: "Valor mínimo" }
  ];

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

          <div className="flex items-center space-x-2">
            <Switch 
              id="is_third_party_cost" 
              checked={isThirdPartyCost} 
              onCheckedChange={setIsThirdPartyCost}
            />
            <Label htmlFor="is_third_party_cost" className="cursor-pointer">
              Custo com Terceiros
            </Label>
          </div>

          {isThirdPartyCost ? (
            <div className="space-y-2">
              <Label htmlFor="cost_amount">Valor do Custo (R$)</Label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="cost_amount" 
                  type="number" 
                  step="0.01"
                  value={costAmount}
                  onChange={(e) => setCostAmount(parseFloat(e.target.value))}
                  className="pl-10"
                  min="0"
                />
              </div>
              <p className="text-sm text-gray-500">
                Este valor será adicionado diretamente ao custo do projeto, sem contabilizar horas.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="hours_type">Tipo de Horas</Label>
                <Select 
                  value={hoursType} 
                  onValueChange={(value) => setHoursType(value)}
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
                    value={fixedHours}
                    onChange={(e) => setFixedHours(parseFloat(e.target.value))}
                    min="0"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="hours_formula">Fórmula de Horas</Label>
                    <div className="flex space-x-2">
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
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Inserir Função
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="w-56 bg-white border border-gray-200 max-h-[300px] overflow-y-auto"
                        >
                          {availableFunctions.map((func) => (
                            <DropdownMenuItem
                              key={func.name}
                              onClick={() => insertFunctionTemplate(func.name)}
                              className="flex justify-between hover:bg-blue-50"
                            >
                              <span className="font-medium">{func.name}</span>
                              <span className="text-gray-600">{func.description}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Textarea 
                    id="hours_formula" 
                    ref={textareaRef}
                    {...register("hours_formula")}
                    onChange={(e) => handleFormulaChange(e.target.value)}
                    placeholder="Ex: IF(SKU_COUNT > 1000, SKU_COUNT * 0.01, SKU_COUNT * 0.02)"
                    className="font-mono text-sm"
                    rows={3}
                  />
                  <div className="text-sm mt-1">
                    <p className="text-gray-500">Funções disponíveis: IF, ROUNDUP, ROUNDDOWN, ROUND, SUM, MAX, MIN</p>
                    {previewHours !== null && (
                      <p className="text-blue-600 font-medium mt-1">
                        Horas calculadas: {previewHours}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

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
