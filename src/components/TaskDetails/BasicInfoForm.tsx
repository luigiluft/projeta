
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
import { Calculator, Variable } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

      console.log('Fórmula após substituição de atributos:', evaluableFormula);

      // Modificar para usar ; como separador de parâmetros nas funções
      // IF(condition; trueValue; falseValue)
      evaluableFormula = evaluableFormula.replace(/IF\s*\(\s*([^;]+);\s*([^;]+);\s*([^)]+)\s*\)/gi, 
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

      // ROUND(value; decimals)
      evaluableFormula = evaluableFormula.replace(/ROUND\s*\(\s*([^;]+);\s*([^)]+)\s*\)/gi, 
        (match, value, decimals) => {
          return `(Math.round(${value} * Math.pow(10, ${decimals})) / Math.pow(10, ${decimals}))`;
        }
      );

      // SUM(value1; value2; ...)
      evaluableFormula = evaluableFormula.replace(/SUM\s*\(\s*([^)]+)\s*\)/gi, 
        (match, values) => {
          const valueArray = values.split(';').map(v => v.trim());
          return `(${valueArray.join(' + ')})`;
        }
      );

      // MAX(value1; value2; ...)
      evaluableFormula = evaluableFormula.replace(/MAX\s*\(\s*([^)]+)\s*\)/gi, 
        (match, values) => {
          const valueArray = values.split(';').map(v => v.trim());
          return `Math.max(${valueArray.join(', ')})`;
        }
      );

      // MIN(value1; value2; ...)
      evaluableFormula = evaluableFormula.replace(/MIN\s*\(\s*([^)]+)\s*\)/gi, 
        (match, values) => {
          const valueArray = values.split(';').map(v => v.trim());
          return `Math.min(${valueArray.join(', ')})`;
        }
      );

      console.log('Fórmula após tratamento de funções:', evaluableFormula);

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
        console.error('Resultado inválido:', result);
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
    console.log('Formula changed to:', formula);
    form.setValue("hours_formula", formula);
    
    if (formula && projectAttributes) {
      const result = calculateHours(formula);
      setPreviewHours(result);
    }
  };

  const insertAttributeAtCursor = (attributeCode: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    
    const currentFormula = form.getValues("hours_formula") || "";
    
    // Inserir a variável na posição atual do cursor
    const newFormula = 
      currentFormula.substring(0, selectionStart) + 
      attributeCode + 
      currentFormula.substring(selectionEnd);
    
    form.setValue("hours_formula", newFormula);
    handleFormulaChange(newFormula);
    
    // Definir a nova posição do cursor após a variável inserida
    setTimeout(() => {
      const newCursorPosition = selectionStart + attributeCode.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const insertFunctionTemplate = (funcName: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    
    let template = "";
    
    switch (funcName) {
      case "IF":
        template = "IF(condition; valueIfTrue; valueIfFalse)";
        break;
      case "ROUNDUP":
        template = "ROUNDUP(value)";
        break;
      case "ROUNDDOWN":
        template = "ROUNDDOWN(value)";
        break;
      case "ROUND":
        template = "ROUND(value; decimals)";
        break;
      case "SUM":
        template = "SUM(value1; value2; ...)";
        break;
      case "MAX":
        template = "MAX(value1; value2; ...)";
        break;
      case "MIN":
        template = "MIN(value1; value2; ...)";
        break;
      default:
        template = funcName + "()";
    }
    
    const currentFormula = form.getValues("hours_formula") || "";
    
    // Inserir a função na posição atual do cursor
    const newFormula = 
      currentFormula.substring(0, selectionStart) + 
      template + 
      currentFormula.substring(selectionEnd);
    
    form.setValue("hours_formula", newFormula);
    handleFormulaChange(newFormula);
    
    // Definir a nova posição do cursor após a função inserida
    setTimeout(() => {
      const newCursorPosition = selectionStart + template.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
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
              value={form.watch("hours_formula") || ""}
              onChange={(e) => handleFormulaChange(e.target.value)}
              placeholder="Ex: IF(SKU_COUNT>1000; SKU_COUNT*0.01; SKU_COUNT*0.02)"
              className="font-mono text-sm"
              rows={4}
            />
            <div className="text-sm mt-2">
              <p className="text-gray-500 mb-2">Funções disponíveis: IF, ROUNDUP, ROUNDDOWN, ROUND, SUM, MAX, MIN (use ; como separador)</p>
              
              {previewHours !== null && (
                <div className="flex items-center mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <Calculator className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <span className="font-medium">Horas calculadas:</span>
                    <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {previewHours.toFixed(2)}h
                    </Badge>
                  </div>
                </div>
              )}
            </div>
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
