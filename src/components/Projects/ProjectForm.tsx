
import { Project, Task, Attribute } from "@/types/project";
import { useState, useEffect } from "react";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { toast } from "sonner";
import { ProjectBasicInfo } from "./ProjectBasicInfo";
import { EpicSelector } from "./EpicSelector";
import { ProjectFormProvider } from "./ProjectFormProvider";
import { ProjectContent } from "./ProjectContent";
import { ProjectActions } from "./ProjectActions";
import { useProjectCalculations } from "@/hooks/projects/useProjectCalculations";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectFormSchema } from "@/utils/projectFormSchema";
import { Form } from "@/components/ui/form";

// Define constants
const TEAM_RATES = {
  "BK": 78.75,
  "DS": 48.13,
  "PMO": 87.50,
  "PO": 35.00,
  "CS": 48.13,
  "FRJ": 70.00,
  "FRP": 119.00,
  "BKT": 131.04,
  "ATS": 65.85,
};

const DEFAULT_PROFIT_MARGIN = 30;

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
  const [estimatedEndDate, setEstimatedEndDate] = useState<string | null>(null);
  const { estimateDeliveryDates } = useProjectCalculations();
  
  // Define o formulário no componente principal
  const formSchema = createProjectFormSchema(attributes);
  const defaultValues: any = {
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    client_name: initialValues?.client_name || "",
    start_date: initialValues?.start_date || "",
  };
  
  // Populate default values for attributes from initialValues
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
    const tasks: Task[] = [];
    selectedEpics.forEach(epic => {
      if (epicTasks[epic]) {
        tasks.push(...epicTasks[epic]);
      }
    });
    setSelectedTasks(tasks);
    calculateEstimatedEndDate(tasks);
  }, [selectedEpics, epicTasks]);

  useEffect(() => {
    if (initialValues?.epic && initialSelectedEpics.length === 0) {
      const epics = initialValues.epic.split(',').map(e => e.trim());
      setSelectedEpics(epics);
    } else if (initialSelectedEpics.length > 0) {
      setSelectedEpics(initialSelectedEpics);
    }
  }, [initialValues, initialSelectedEpics]);

  const calculateEstimatedEndDate = async (tasks: Task[]) => {
    const startDateValue = form.getValues("start_date");
    
    if (!startDateValue || tasks.length === 0) {
      setEstimatedEndDate(null);
      return;
    }

    try {
      const implementationTasks = tasks.filter(task => 
        !task.epic.toLowerCase().includes('sustentação') && 
        !task.epic.toLowerCase().includes('sustentacao'));
      
      if (implementationTasks.length === 0) {
        setEstimatedEndDate(null);
        return;
      }

      const orderedTasks = [...implementationTasks].sort((a, b) => {
        if (a.depends_on === b.id) return 1;
        if (b.depends_on === a.id) return -1;
        return (a.order || 0) - (b.order || 0);
      });

      const startDate = new Date(startDateValue);
      startDate.setHours(9, 0, 0, 0);

      let currentDate = new Date(startDate);
      let latestEndDate = new Date(startDate);

      const taskEndDates = new Map<string, Date>();

      for (const task of orderedTasks) {
        if (task.depends_on && taskEndDates.has(task.depends_on)) {
          const dependencyEndDate = taskEndDates.get(task.depends_on)!;
          if (dependencyEndDate > currentDate) {
            currentDate = new Date(dependencyEndDate);
          }
        }

        const taskHours = task.calculated_hours || task.fixed_hours || 0;
        let workDays = Math.ceil(taskHours / 8);

        for (let i = 0; i < workDays; i++) {
          while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        taskEndDates.set(task.id, new Date(currentDate));

        if (currentDate > latestEndDate) {
          latestEndDate = new Date(currentDate);
        }
      }

      const formattedEndDate = format(latestEndDate, 'dd/MM/yyyy', { locale: ptBR });
      setEstimatedEndDate(formattedEndDate);
      
    } catch (error) {
      console.error("Erro ao calcular data estimada:", error);
      setEstimatedEndDate(null);
    }
  };

  const handleEpicSelectionChange = (epics: string[]) => {
    setSelectedEpics(epics);
    onEpicsChange(epics);
  };

  const handleFormSubmit = (values: ProjectFormValues) => {
    if (selectedEpics.length === 0) {
      toast.error("Selecione pelo menos um Epic para o projeto");
      return;
    }

    const implementationTasks = selectedTasks.filter(task => 
      !task.epic.toLowerCase().includes('sustentação') && 
      !task.epic.toLowerCase().includes('sustentacao'));
    
    const sustainmentTasks = selectedTasks.filter(task => 
      task.epic.toLowerCase().includes('sustentação') || 
      task.epic.toLowerCase().includes('sustentacao'));
    
    const implTaskCosts = implementationTasks.reduce((acc, task) => {
      const hourlyRate = TEAM_RATES[task.owner as keyof typeof TEAM_RATES] || 0;
      const hours = task.calculated_hours || (task.hours_formula ? parseFloat(task.hours_formula) : 0);
      return acc + (hourlyRate * hours);
    }, 0);
    
    const taskCosts = selectedTasks.reduce((acc, task) => {
      const hourlyRate = TEAM_RATES[task.owner as keyof typeof TEAM_RATES] || 0;
      const hours = task.calculated_hours || (task.hours_formula ? parseFloat(task.hours_formula) : 0);
      return acc + (hourlyRate * hours);
    }, 0);

    const totalHours = selectedTasks.reduce((sum, task) => {
      const hours = task.calculated_hours || (task.hours_formula ? parseFloat(task.hours_formula) : 0);
      return sum + hours;
    }, 0);

    const totalCost = taskCosts * (1 + DEFAULT_PROFIT_MARGIN / 100);

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
      metadata: {
        attribute_values: Object.fromEntries(
          attributes
            .filter(attr => attr.type === 'number')
            .map(attr => [attr.id, Number(values[attr.id]) || 0])
        ),
        implementation_tasks_count: implementationTasks.length,
        sustainment_tasks_count: sustainmentTasks.length,
        implementation_cost: implTaskCosts
      },
      settings: {},
    } as Project);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow mb-6">
        <ProjectBasicInfo 
          form={form} 
          readOnly={readOnly} 
          estimatedEndDate={estimatedEndDate}
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
