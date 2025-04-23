import { useState, useEffect } from "react";
import { Project, Task, Attribute } from "@/types/project";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectFormSchema } from "@/utils/projectFormSchema";
import { EpicSelector } from "./EpicSelector";
import { ProjectContent } from "./ProjectContent";
import { ProjectActions } from "./ProjectActions";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { format, addBusinessDays, setHours, setMinutes } from "date-fns";

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
  requireProjectName?: boolean;
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
  selectedEpics: initialSelectedEpics = [],
  requireProjectName = true
}: ProjectFormProps) {
  const {
    selectedEpics,
    selectedTasks,
    estimatedEndDate,
    setEstimatedEndDate,
    handleEpicSelectionChange,
  } = useProjectManagement(epicTasks);

  const [attributeValues, setAttributeValues] = useState<Record<string, number>>({});
  const formSchema = createProjectFormSchema(attributes, requireProjectName);
  
  const defaultValues: any = {
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    client_name: initialValues?.client_name || "",
    start_date: initialValues?.start_date || "",
  };

  if (initialValues) {
    if (initialValues.attribute_values) {
      Object.entries(initialValues.attribute_values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          defaultValues[key] = value;
        }
      });
    }

    if (initialValues.attributes && 
        typeof initialValues.attributes === 'object' && 
        !Array.isArray(initialValues.attributes)) {
      Object.entries(initialValues.attributes).forEach(([key, value]) => {
        if (defaultValues[key] === undefined && value !== undefined && value !== null) {
          defaultValues[key] = value;
        }
      });
    }
  }

  attributes.forEach(attr => {
    if (defaultValues[attr.id] === undefined && attr.defaultValue !== undefined) {
      const value = attr.type === "number" && attr.defaultValue !== "" 
        ? Number(attr.defaultValue) 
        : attr.defaultValue;
      defaultValues[attr.id] = value;
    }
  });
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    const startDateValue = form.getValues("start_date");
    
    if (startDateValue && selectedTasks.length > 0) {
      calculateEstimatedEndDate(selectedTasks, startDateValue);
    }
  }, [form.getValues("start_date"), selectedTasks]);

  useEffect(() => {
    const tasks: Task[] = [];
    selectedEpics.forEach(epic => {
      if (epicTasks[epic]) {
        tasks.push(...epicTasks[epic]);
      }
    });
    
    const startDateValue = form.getValues("start_date");
    if (startDateValue && tasks.length > 0) {
      calculateEstimatedEndDate(tasks, startDateValue);
    }
  }, [selectedEpics, epicTasks]);

  useEffect(() => {
    if (initialValues?.epic && initialSelectedEpics.length === 0) {
      const epics = initialValues.epic.split(',').map(e => e.trim());
      handleEpicSelectionChange(epics);
    } else if (initialSelectedEpics.length > 0) {
      handleEpicSelectionChange(initialSelectedEpics);
    }
  }, [initialValues, initialSelectedEpics]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "start_date" && value.start_date && selectedTasks.length > 0) {
        calculateEstimatedEndDate(selectedTasks, value.start_date);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, selectedTasks]);

  const calculateEstimatedEndDate = (tasks: Task[], startDateStr: string) => {
    if (!startDateStr || tasks.length === 0) {
      setEstimatedEndDate(null);
      return;
    }

    try {
      console.log("Calculando data estimada para", tasks.length, "tarefas com data inicial:", startDateStr);
      
      const implementationTasks = tasks.filter(task => 
        !task.epic.toLowerCase().includes('sustentação') && 
        !task.epic.toLowerCase().includes('sustentacao') &&
        !task.epic.toLowerCase().includes('atendimento ao consumidor') &&
        !task.epic.toLowerCase().includes('sac 4.0') &&
        !task.epic.toLowerCase().includes('faturamento de gestão operacional') &&
        !task.epic.toLowerCase().includes('faturamento de gestao operacional'));
      
      if (implementationTasks.length === 0) {
        console.log("Nenhuma tarefa de implementação encontrada.");
        setEstimatedEndDate(null);
        return;
      }
      
      console.log("Tarefas de implementação:", implementationTasks.length);

      const orderedTasks = [...implementationTasks].sort((a, b) => {
        if (a.depends_on && a.depends_on === b.id) return 1;
        if (b.depends_on && b.depends_on === a.id) return -1;
        return (a.order || 0) - (b.order || 0);
      });

      const startDate = new Date(startDateStr);
      startDate.setHours(9, 0, 0, 0);

      let projectEndDate = new Date(startDate);
      
      const ownerAvailability: Record<string, Date> = {};
      const taskEndDates: Record<string, Date> = {};

      orderedTasks.forEach(task => {
        let taskStartDate = new Date(startDate);
        
        if (task.owner && ownerAvailability[task.owner]) {
          const ownerDate = new Date(ownerAvailability[task.owner]);
          taskStartDate = addBusinessDays(ownerDate, 1);
          taskStartDate = setHours(setMinutes(taskStartDate, 0), 9);
        }
        
        if (task.depends_on && taskEndDates[task.depends_on]) {
          const dependencyEndDate = new Date(taskEndDates[task.depends_on]);
          if (dependencyEndDate > taskStartDate) {
            taskStartDate = addBusinessDays(dependencyEndDate, 1);
            taskStartDate = setHours(setMinutes(taskStartDate, 0), 9);
          }
        }
        
        const taskHours = task.calculated_hours || task.fixed_hours || 0;
        
        const durationInDays = 1;
        
        console.log(`Tarefa: ${task.task_name}, Horas: ${taskHours}, Duração: ${durationInDays} dias`);
        
        let taskEndDate = taskStartDate;
        if (durationInDays > 0) {
          taskEndDate = addBusinessDays(taskStartDate, durationInDays - 1);
          taskEndDate = setHours(setMinutes(taskEndDate, 0), 17);
        }
        
        if (task.owner) {
          ownerAvailability[task.owner] = taskEndDate;
        }
        
        taskEndDates[task.id] = taskEndDate;
        
        if (taskEndDate > projectEndDate) {
          projectEndDate = new Date(taskEndDate);
        }
      });
      
      console.log("Data estimada de término calculada:", projectEndDate);
      const formattedEndDate = format(projectEndDate, 'dd/MM/yyyy', { locale: ptBR });
      setEstimatedEndDate(formattedEndDate);
      
    } catch (error) {
      console.error("Erro ao calcular data estimada:", error);
      setEstimatedEndDate(null);
    }
  };

  const handleFormSubmit = (values: ProjectFormValues) => {
    if (selectedEpics.length === 0) {
      toast.error("Selecione pelo menos um Epic para o projeto");
      return;
    }

    onSubmit({
      ...values,
      id: editingId || crypto.randomUUID(),
      name: values.name,
      project_name: values.name,
      epic: selectedEpics.join(', '),
      type: 'default',
      description: values.description,
      client_name: values.client_name,
      start_date: values.start_date,
      expected_end_date: estimatedEndDate ? format(new Date(estimatedEndDate.split('/').reverse().join('-')), 'yyyy-MM-dd') : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_hours: 0,
      total_cost: 0,
      base_cost: 0,
      profit_margin: 30,
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
      metadata: {
        attribute_values: Object.fromEntries(
          attributes
            .filter(attr => attr.type === 'number')
            .map(attr => [attr.id, Number(values[attr.id]) || 0])
        ),
        implementation_tasks_count: 0,
        sustainment_tasks_count: 0,
        implementation_cost: 0
      },
      settings: {},
    } as Project);
  };

  const { taskColumns, handleColumnsChange } = useProjectTasks([]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite o nome do projeto" 
                    {...field} 
                    readOnly={readOnly}
                    className={readOnly ? "bg-gray-50" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome do cliente" 
                    {...field} 
                    readOnly={readOnly}
                    className={readOnly ? "bg-gray-50" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o projeto" 
                  className={`min-h-[100px] ${readOnly ? "bg-gray-50" : ""}`}
                  {...field} 
                  readOnly={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Epics do Projeto</h3>
          <EpicSelector 
            availableEpics={availableEpics} 
            selectedEpics={selectedEpics}
            onChange={handleEpicSelectionChange}
            readOnly={readOnly}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    readOnly={readOnly}
                    className={readOnly ? "bg-gray-50" : ""}
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value && selectedTasks.length > 0) {
                        calculateEstimatedEndDate(selectedTasks, e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormItem>
              <FormLabel>Data Estimada de Término</FormLabel>
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted/30">
                {estimatedEndDate ? (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{estimatedEndDate}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Selecione Epics e tarefas para calcular
                  </span>
                )}
              </div>
              <FormMessage />
            </FormItem>
          </div>
        </div>

        <ProjectContent 
          form={form}
          selectedTasks={selectedTasks}
          taskColumns={taskColumns}
          handleColumnsChange={handleColumnsChange}
          attributeValues={attributeValues}
          attributes={attributes}
          editingId={editingId}
          readOnly={readOnly}
        />

        <ProjectActions 
          isLoading={isLoading}
          editingId={editingId}
          readOnly={readOnly}
        />
      </form>
    </Form>
  );
}
