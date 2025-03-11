
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingTab } from "./PricingTab";
import { ScopeTab } from "./ScopeTab";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { Attribute, Project, Task } from "@/types/project";
import { ProjectBasicInfo } from "./ProjectBasicInfo";
import { createProjectFormSchema, ProjectFormValues } from "@/utils/projectFormSchema";
import { DEFAULT_PROFIT_MARGIN, teamRates } from "@/constants/projectConstants";
import { EpicSelector } from "./EpicSelector";
import { useState, useEffect } from "react";

interface ProjectFormProps {
  editingId?: string | null;
  attributes?: Attribute[];
  onSubmit?: (values: Project) => void;
  initialValues?: Project;
  availableEpics: string[];
  epicTasks: { [key: string]: Task[] };
  onEpicsChange?: (epics: string[]) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  selectedEpics?: string[];
}

export function ProjectForm({ 
  editingId = null, 
  attributes = [], 
  onSubmit = () => {}, 
  initialValues, 
  availableEpics,
  epicTasks,
  onEpicsChange = () => {},
  isLoading = false,
  readOnly = false,
  selectedEpics: initialSelectedEpics = []
}: ProjectFormProps) {
  const [selectedEpics, setSelectedEpics] = useState<string[]>(initialSelectedEpics);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const { taskColumns, handleColumnsChange } = useProjectTasks([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, number>>({});

  // Update selected tasks when epics change
  useEffect(() => {
    const tasks: Task[] = [];
    selectedEpics.forEach(epic => {
      if (epicTasks[epic]) {
        tasks.push(...epicTasks[epic]);
      }
    });
    setSelectedTasks(tasks);
  }, [selectedEpics, epicTasks]);

  // Initialize selected epics if provided in initialValues
  useEffect(() => {
    if (initialValues?.epic && initialSelectedEpics.length === 0) {
      const epics = initialValues.epic.split(',').map(e => e.trim());
      setSelectedEpics(epics);
    } else if (initialSelectedEpics.length > 0) {
      setSelectedEpics(initialSelectedEpics);
    }
  }, [initialValues, initialSelectedEpics]);

  const formSchema = createProjectFormSchema(attributes);

  // Preparar valores iniciais com os valores corretos do projeto
  const defaultValues: any = {
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    client_name: initialValues?.client_name || "",
    start_date: initialValues?.start_date || "",
  };

  // Log para debug dos valores iniciais recebidos
  console.log("Valores iniciais recebidos:", initialValues);
  
  // Campos especiais para verificar
  const specialFields = ['tempo_de_atendimento_por_cliente', 'pedidos_mes', 'ticket_medio'];
  specialFields.forEach(field => {
    console.log(`Verificando campo especial ${field} no initialValues:`, 
      initialValues?.attribute_values?.[field], 
      initialValues?.attributes?.[field]);
  });

  // Adicionar valores específicos que podem vir do attribute_values ou attributes
  if (initialValues) {
    // Primeiro, adicionar todos os valores dos atributos
    if (initialValues.attribute_values) {
      Object.entries(initialValues.attribute_values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          defaultValues[key] = value;
          console.log(`Definindo ${key} de attribute_values:`, value);
        }
      });
    }

    // Em seguida, adicionar valores dos attributes se não existirem em attribute_values
    if (initialValues.attributes) {
      Object.entries(initialValues.attributes).forEach(([key, value]) => {
        if (defaultValues[key] === undefined && value !== undefined && value !== null) {
          defaultValues[key] = value;
          console.log(`Definindo ${key} de attributes:`, value);
        }
      });
    }
  }

  // Adicionar valores padrão para cada atributo que ainda não tenha valor
  attributes.forEach(attr => {
    if (defaultValues[attr.id] === undefined && attr.defaultValue !== undefined) {
      const value = attr.type === "number" && attr.defaultValue !== "" 
        ? Number(attr.defaultValue) 
        : attr.defaultValue;
      defaultValues[attr.id] = value;
      console.log(`Definindo ${attr.id} do valor padrão:`, value);
    }
  });

  // Verificar e corrigir valores especiais (fazer isso por último para priorizar)
  specialFields.forEach(field => {
    console.log(`Verificando campo especial ${field}:`, defaultValues[field]);
    
    // Verificar em attribute_values
    if (initialValues?.attribute_values && field in initialValues.attribute_values) {
      defaultValues[field] = initialValues.attribute_values[field];
      console.log(`Definido ${field} de attribute_values:`, defaultValues[field]);
    }
    // Verificar em attributes
    else if (initialValues?.attributes && typeof initialValues.attributes === 'object' && 
             !Array.isArray(initialValues.attributes) && field in initialValues.attributes) {
      defaultValues[field] = initialValues.attributes[field];
      console.log(`Definido ${field} de attributes:`, defaultValues[field]);
    }
  });

  console.log("Valores iniciais do formulário após processamento:", defaultValues);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Atualizar valores dos atributos quando eles mudarem no formulário
  useEffect(() => {
    const subscription = form.watch((values) => {
      const newAttributeValues: Record<string, number> = {};
      
      attributes.forEach(attr => {
        if (attr.type === 'number' && values[attr.id]) {
          newAttributeValues[attr.id] = Number(values[attr.id]) || 0;
        }
      });
      
      setAttributeValues(newAttributeValues);
    });
    
    return () => subscription.unsubscribe();
  }, [form, attributes]);

  const handleEpicSelectionChange = (epics: string[]) => {
    setSelectedEpics(epics);
    onEpicsChange(epics);
  };

  const handleSubmit = (values: ProjectFormValues) => {
    if (selectedEpics.length === 0) {
      toast.error("Selecione pelo menos um Epic para o projeto");
      return;
    }

    const taskCosts = selectedTasks.reduce((acc, task) => {
      const hourlyRate = teamRates[task.owner as keyof typeof teamRates] || 0;
      const hours = task.calculated_hours || (task.hours_formula ? parseFloat(task.hours_formula) : 0);
      return acc + (hourlyRate * hours);
    }, 0);

    const totalHours = selectedTasks.reduce((sum, task) => {
      const hours = task.calculated_hours || (task.hours_formula ? parseFloat(task.hours_formula) : 0);
      return sum + hours;
    }, 0);

    const totalCost = taskCosts * (1 + DEFAULT_PROFIT_MARGIN / 100);

    const projectData: Project = {
      id: editingId || crypto.randomUUID(),
      name: values.name,
      project_name: values.name,
      epic: selectedEpics.join(', '),
      type: 'default', // Valor padrão para o campo type
      description: values.description,
      client_name: values.client_name,
      start_date: values.start_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_hours: totalHours,
      total_cost: totalCost,
      base_cost: taskCosts,
      profit_margin: DEFAULT_PROFIT_MARGIN,
      status: 'draft',
      currency: 'BRL',
      tasks: selectedTasks,
      progress: 0,
      delay_days: 0,
      attributes: Object.fromEntries(
        attributes.map((attr) => [
          attr.id,
          attr.type === "number"
            ? Number(values[attr.id]) || 0
            : String(values[attr.id]) || ""
        ])
      ),
      attribute_values: Object.fromEntries(
        attributes
          .filter(attr => attr.type === 'number')
          .map(attr => [attr.id, Number(values[attr.id]) || 0])
      ),
      favorite: false,
      priority: 0,
      tags: [],
      archived: false,
      deleted: false,
      version: 1,
      metadata: {},
      settings: {},
    };
    
    onSubmit(projectData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow mb-6">
        <ProjectBasicInfo form={form} readOnly={readOnly} />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Epics do Projeto</h3>
          <EpicSelector 
            availableEpics={availableEpics} 
            selectedEpics={selectedEpics}
            onChange={handleEpicSelectionChange}
            readOnly={readOnly}
          />
        </div>

        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="pricing" className="flex-1">Precificação</TabsTrigger>
            <TabsTrigger value="scope" className="flex-1">Escopo</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing">
            <PricingTab form={form} attributes={attributes} readOnly={readOnly} />
          </TabsContent>

          <TabsContent value="scope">
            <ScopeTab 
              tasks={selectedTasks} 
              columns={taskColumns}
              onColumnsChange={handleColumnsChange}
              attributeValues={attributeValues}
            />
          </TabsContent>
        </Tabs>

        {!readOnly && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : (editingId ? "Atualizar" : "Criar")} Projeto
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
