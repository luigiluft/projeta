import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingTab } from "./PricingTab";
import { ScopeTab } from "./ScopeTab";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { Attribute, Project } from "@/types/project";

interface ProjectFormProps {
  editingId: string | null;
  attributes: Attribute[];
  onSubmit: (values: Project) => void;
  initialValues?: Project;
}

const teamRates = {
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
      hours: 0,
      owner: "PO",
      dependency: null,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      order_number: 2,
      is_active: true,
      phase: "Implementação",
      epic: "Implementação Ecommerce B2C",
      story: "Briefing",
      task_name: "Documentação do briefing técnico",
      hours: 0,
      owner: "PO",
      dependency: null,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      order_number: 3,
      is_active: true,
      phase: "Implementação",
      epic: "Implementação Ecommerce B2C",
      story: "Briefing",
      task_name: "Definição do catálogo de produtos, categorias e atributos",
      hours: 1,
      owner: "PO",
      dependency: null,
      created_at: new Date().toISOString()
    }
  ]);

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "O nome deve ter pelo menos 2 caracteres.",
    }),
    ...Object.fromEntries(
      attributes.map((attr) => [
        attr.id,
        attr.type === "number"
          ? z.number().optional()
          : z.string().optional(),
      ])
    ),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      ...Object.fromEntries(
        attributes.map((attr) => [
          attr.id,
          initialValues?.attributes[attr.id] || attr.defaultValue || ""
        ])
      ),
    },
  });

  const handleSubmit = (values: FormValues) => {
    const taskCosts = tasks.reduce((acc, task) => {
      const hourlyRate = teamRates[task.owner as keyof typeof teamRates] || 0;
      return acc + (hourlyRate * (task.hours || 0));
    }, 0);

    const projectData: Project = {
      id: editingId || crypto.randomUUID(),
      name: values.name,
      epic: values.name,
      type: "default",
      created_at: new Date().toISOString(),
      total_hours: tasks.reduce((sum, task) => sum + (task.hours || 0), 0),
      total_cost: taskCosts,
      tasks: tasks,
      attributes: Object.fromEntries(
        attributes.map((attr) => [
          attr.id,
          attr.type === "number"
            ? Number(values[attr.id]) || 0
            : String(values[attr.id]) || ""
        ])
      ),
    };
    
    onSubmit(projectData);
    toast.success(editingId ? "Projeto atualizado com sucesso!" : "Projeto criado com sucesso!");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow mb-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Projeto</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do projeto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
