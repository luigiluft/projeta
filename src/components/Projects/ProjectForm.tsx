
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
import { TaskList } from "@/components/TaskManagement/TaskList";
import { Column } from "@/types/project";

interface Attribute {
  id: string;
  name: string;
  unit: "hours" | "quantity" | "percentage";
  type: "number" | "list" | "text";
  defaultValue?: string;
}

interface Project {
  id: string;
  name: string;
  attributes: Record<string, string | number>;
}

interface ProjectFormProps {
  editingId: string | null;
  attributes: Attribute[];
  onSubmit: (values: Project) => void;
  initialValues?: Project;
}

export function ProjectForm({ editingId, attributes, onSubmit, initialValues }: ProjectFormProps) {
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
    const projectData: Project = {
      id: editingId || crypto.randomUUID(),
      name: values.name,
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

  const mockTasks = [
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
  ];

  const taskColumns = [
    { id: "task_name", label: "Tarefa", visible: true },
    { id: "phase", label: "Fase", visible: true },
    { id: "epic", label: "Epic", visible: true },
    { id: "story", label: "Story", visible: true },
    { id: "hours", label: "Horas", visible: true },
    { id: "owner", label: "Responsável", visible: true },
    { id: "dependency", label: "Dependência", visible: true },
    { id: "created_at", label: "Criado em", visible: true },
  ];

  const calculateTotalTime = () => {
    const total = mockTasks.reduce((acc, task) => {
      return {
        min: acc.min + Number(task.hours || 0),
        med: acc.med + Number(task.hours || 0),
        max: acc.max + Number(task.hours || 0)
      };
    }, { min: 0, med: 0, max: 0 });

    return `Min: ${total.min}h | Med: ${total.med}h | Max: ${total.max}h`;
  };

  const handleColumnsChange = (newColumns: Column[]) => {
    // Update columns state if needed
    console.log("Columns changed:", newColumns);
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

          <TabsContent value="pricing" className="space-y-4 mt-4">
            {attributes.map((attribute) => (
              <FormField
                key={attribute.id}
                control={form.control}
                name={attribute.id as keyof FormValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{attribute.name}</FormLabel>
                    <FormControl>
                      <Input
                        type={attribute.type === "number" ? "number" : "text"}
                        placeholder={`Digite ${attribute.name.toLowerCase()}`}
                        {...field}
                        onChange={(e) => {
                          const value = attribute.type === "number"
                            ? e.target.value === "" ? "" : Number(e.target.value)
                            : e.target.value;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </TabsContent>

          <TabsContent value="scope" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lista de Tarefas</h3>
                <div className="text-sm text-gray-600">
                  Total de Horas: {calculateTotalTime()}
                </div>
              </div>
              <TaskList 
                tasks={mockTasks} 
                columns={taskColumns}
                onColumnsChange={handleColumnsChange}
              />
            </div>
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
