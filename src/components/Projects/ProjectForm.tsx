
import { Project, Task, Attribute } from "@/types/project";
import { useState, useEffect } from "react";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { toast } from "sonner";
import { ProjectBasicInfo } from "./ProjectBasicInfo";
import { ProjectFormProvider } from "./ProjectFormProvider";
import { ProjectContent } from "./ProjectContent";
import { ProjectActions } from "./ProjectActions";
import { format } from "date-fns";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectFormSchema } from "@/utils/projectFormSchema";
import { Form } from "@/components/ui/form";
import { TaskSelector } from "./TaskSelector";
import { EndDateCalculator } from "./EndDateCalculator";
import { ProjectCostCalculator } from "./ProjectCostCalculator";

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
  
  // Project cost calculations
  const [projectCosts, setProjectCosts] = useState({
    totalHours: 0,
    taskCosts: 0,
    implTaskCosts: 0,
    totalCost: 0
  });
  
  const formSchema = createProjectFormSchema(attributes);
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
    if (initialValues?.epic && initialSelectedEpics.length === 0) {
      const epics = initialValues.epic.split(',').map(e => e.trim());
      setSelectedEpics(epics);
    } else if (initialSelectedEpics.length > 0) {
      setSelectedEpics(initialSelectedEpics);
    }
  }, [initialValues, initialSelectedEpics]);

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
      total_hours: projectCosts.totalHours,
      total_cost: projectCosts.totalCost,
      base_cost: projectCosts.taskCosts,
      profit_margin: 30, // DEFAULT_PROFIT_MARGIN
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
        implementation_cost: projectCosts.implTaskCosts
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
          selectedEpics={selectedEpics}
          selectedTasks={selectedTasks}
        />
        
        <TaskSelector
          availableEpics={availableEpics}
          epicTasks={epicTasks}
          selectedEpics={selectedEpics}
          onEpicsChange={handleEpicSelectionChange}
          onTasksChange={setSelectedTasks}
          readOnly={readOnly}
        />

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

        <EndDateCalculator 
          tasks={selectedTasks}
          startDate={form.watch("start_date")}
          onEndDateCalculated={setEstimatedEndDate}
        />

        <ProjectCostCalculator 
          tasks={selectedTasks}
          onCostsCalculated={setProjectCosts}
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
