import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingTab } from "./PricingTab";
import { ScopeTab } from "./ScopeTab";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { Attribute, Project } from "@/types/project";
import { ProjectBasicInfo } from "./ProjectBasicInfo";
import { createProjectFormSchema, ProjectFormValues } from "@/utils/projectFormSchema";
import { DEFAULT_PROFIT_MARGIN, teamRates } from "@/constants/projectConstants";

interface ProjectFormProps {
  editingId: string | null;
  attributes: Attribute[];
  onSubmit: (values: Project) => void;
  initialValues?: Project;
}

export function ProjectForm({ editingId, attributes, onSubmit, initialValues }: ProjectFormProps) {
  const { tasks, taskColumns, handleColumnsChange } = useProjectTasks([
    {
      id: "1",
      order_number: 1,
      is_active: true,
      phase: "Implementação",
      epic: "Implementação Ecommerce B2C",
      story: "Briefing",
      task_name: "Reunião do briefing técnico",
      owner: "PO",
      created_at: new Date().toISOString(),
      status: "pending"
    },
    {
      id: "2",
      order_number: 2,
      is_active: true,
      phase: "Implementação",
      epic: "Implementação Ecommerce B2C",
      story: "Briefing",
      task_name: "Documentação do briefing técnico",
      owner: "PO",
      created_at: new Date().toISOString(),
      status: "pending"
    },
    {
      id: "3",
      order_number: 3,
      is_active: true,
      phase: "Implementação",
      epic: "Implementação Ecommerce B2C",
      story: "Briefing",
      task_name: "Definição do catálogo de produtos, categorias e atributos",
      owner: "PO",
      created_at: new Date().toISOString(),
      status: "pending"
    }
  ]);

  const formSchema = createProjectFormSchema(attributes);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      type: initialValues?.type || "default",
      client_name: initialValues?.client_name || "",
      due_date: initialValues?.due_date || "",
      ...Object.fromEntries(
        attributes.map((attr) => [
          attr.id,
          initialValues?.attributes[attr.id] || attr.defaultValue || ""
        ])
      ),
    },
  });

  const handleSubmit = (values: ProjectFormValues) => {
    const taskCosts = tasks.reduce((acc, task) => {
      const hourlyRate = teamRates[task.owner as keyof typeof teamRates] || 0;
      return acc + (hourlyRate * (task.hours || 0));
    }, 0);

    const totalCost = taskCosts * (1 + DEFAULT_PROFIT_MARGIN / 100);

    const projectData: Project = {
      id: editingId || crypto.randomUUID(),
      name: values.name,
      project_name: values.name,
      epic: values.name,
      type: values.type,
      description: values.description,
      client_name: values.client_name,
      due_date: values.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_hours: tasks.reduce((sum, task) => sum + (task.hours || 0), 0),
      total_cost: totalCost,
      base_cost: taskCosts,
      profit_margin: DEFAULT_PROFIT_MARGIN,
      status: 'draft',
      currency: 'BRL',
      tasks: tasks,
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
      favorite: false,
      priority: 0,
      tags: [],
      archived: false,
      archived_at: undefined,
      deleted: false,
      deleted_at: undefined,
      version: 1,
      metadata: {},
      settings: {},
    };
    
    onSubmit(projectData);
    toast.success(editingId ? "Projeto atualizado com sucesso!" : "Projeto criado com sucesso!");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow mb-6">
        <ProjectBasicInfo form={form} />

        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="pricing" className="flex-1">Precificação</TabsTrigger>
            <TabsTrigger value="scope" className="flex-1">Escopo</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing">
            <PricingTab form={form} attributes={attributes} />
          </TabsContent>

          <TabsContent value="scope">
            <ScopeTab 
              tasks={tasks} 
              columns={taskColumns}
              onColumnsChange={handleColumnsChange}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit">
            {editingId ? "Atualizar" : "Criar"} Projeto
          </Button>
        </div>
      </form>
    </Form>
  );
}
