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
      name: "Epic 1: Core Features",
      type: "epic" as const,
      priority: "high" as const,
      status: "in_progress" as const,
      responsible: "John Doe",
      timeMin: "40",
      timeMed: "50",
      timeMax: "60"
    },
    {
      id: "2",
      name: "Story 1.1: User Authentication",
      type: "story" as const,
      priority: "medium" as const,
      status: "backlog" as const,
      responsible: "Jane Smith",
      timeMin: "16",
      timeMed: "20",
      timeMax: "24"
    },
    {
      id: "3",
      name: "Task 1.1.1: Implement Login Form",
      type: "task" as const,
      priority: "low" as const,
      status: "done" as const,
      responsible: "Bob Wilson",
      timeMin: "4",
      timeMed: "6",
      timeMax: "8"
    }
  ];

  const taskColumns = [
    { id: "name", label: "Nome", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "priority", label: "Prioridade", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "responsible", label: "Responsável", visible: true },
    { id: "timeMin", label: "Tempo Min (h)", visible: true },
    { id: "timeMed", label: "Tempo Med (h)", visible: true },
    { id: "timeMax", label: "Tempo Max (h)", visible: true }
  ];

  const calculateTotalTime = () => {
    const total = mockTasks.reduce((acc, task) => {
      return {
        min: acc.min + Number(task.timeMin),
        med: acc.med + Number(task.timeMed),
        max: acc.max + Number(task.timeMax)
      };
    }, { min: 0, med: 0, max: 0 });

    return `Min: ${total.min}h | Med: ${total.med}h | Max: ${total.max}h`;
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
              <TaskList tasks={mockTasks} columns={taskColumns} />
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