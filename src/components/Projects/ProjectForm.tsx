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
      itemType: "Epic",
      itemKey: "AGS-135",
      itemId: 21741,
      summary: "Core Features Implementation",
      assignee: "John Doe",
      assigneeId: "JD123",
      reporter: "Jane Smith",
      reporterId: "JS456",
      priority: "Alta",
      status: "Em Progresso",
      resolution: "Unresolved",
      created: "2024-01-22T15:45:46.000+0000",
      updated: "2024-01-23T10:30:00.000+0000",
      resolved: "",
      components: "Frontend",
      affectedVersion: "1.0.0",
      fixVersion: "1.1.0",
      sprints: "Sprint 1",
      timeTracking: "40h remaining",
      internalLinks: ["AGS-136", "AGS-137"],
      externalLinks: "https://example.com/AGS-135",
      originalEstimate: 80,
      parentId: 0,
      parentSummary: "",
      startDate: "2024-01-22",
      totalOriginalEstimate: 80,
      totalTimeSpent: 40,
      remainingEstimate: 40
    },
    {
      id: "2",
      itemType: "História",
      itemKey: "AGS-136",
      itemId: 21742,
      summary: "User Authentication Flow",
      assignee: "Jane Smith",
      assigneeId: "JS456",
      reporter: "John Doe",
      reporterId: "JD123",
      priority: "Média",
      status: "Tarefas pendentes",
      resolution: "Unresolved",
      created: "2024-01-22T16:00:00.000+0000",
      updated: "2024-01-23T11:00:00.000+0000",
      resolved: "",
      components: "Backend",
      affectedVersion: "",
      fixVersion: "1.1.0",
      sprints: "Sprint 1",
      timeTracking: "20h remaining",
      internalLinks: ["AGS-137"],
      externalLinks: "",
      originalEstimate: 40,
      parentId: 21741,
      parentSummary: "Core Features Implementation",
      startDate: "2024-01-23",
      totalOriginalEstimate: 40,
      totalTimeSpent: 20,
      remainingEstimate: 20
    },
    {
      id: "3",
      itemType: "Subtarefa",
      itemKey: "AGS-137",
      itemId: 21743,
      summary: "Implement Login Form",
      assignee: "Bob Wilson",
      assigneeId: "BW789",
      reporter: "Jane Smith",
      reporterId: "JS456",
      priority: "Baixa",
      status: "Concluído",
      resolution: "Done",
      created: "2024-01-22T16:30:00.000+0000",
      updated: "2024-01-23T12:00:00.000+0000",
      resolved: "2024-01-23T12:00:00.000+0000",
      components: "Frontend",
      affectedVersion: "",
      fixVersion: "1.1.0",
      sprints: "Sprint 1",
      timeTracking: "0h remaining",
      internalLinks: [],
      externalLinks: "",
      originalEstimate: 16,
      parentId: 21742,
      parentSummary: "User Authentication Flow",
      startDate: "2024-01-23",
      totalOriginalEstimate: 16,
      totalTimeSpent: 16,
      remainingEstimate: 0
    }
  ];

  const taskColumns = [
    { id: "itemType", label: "Tipo de Item", visible: true },
    { id: "itemKey", label: "Chave do Item", visible: true },
    { id: "itemId", label: "ID do Item", visible: true },
    { id: "summary", label: "Resumo", visible: true },
    { id: "assignee", label: "Responsável", visible: true },
    { id: "assigneeId", label: "ID do Responsável", visible: true },
    { id: "reporter", label: "Relator", visible: true },
    { id: "reporterId", label: "ID do Relator", visible: true },
    { id: "priority", label: "Prioridade", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "resolution", label: "Resolução", visible: true },
    { id: "created", label: "Criado", visible: true },
    { id: "updated", label: "Atualizado", visible: true },
    { id: "resolved", label: "Resolvido", visible: true },
    { id: "components", label: "Componentes", visible: true },
    { id: "affectedVersion", label: "Versão Afetada", visible: true },
    { id: "fixVersion", label: "Versão de Correção", visible: true },
    { id: "sprints", label: "Sprints", visible: true },
    { id: "timeTracking", label: "Histórico de Tempo", visible: true },
    { id: "internalLinks", label: "Links Internos", visible: true },
    { id: "externalLinks", label: "Links Externos", visible: true },
    { id: "originalEstimate", label: "Estimativa Original", visible: true },
    { id: "parentId", label: "ID do Pai", visible: true },
    { id: "parentSummary", label: "Resumo do Pai", visible: true },
    { id: "startDate", label: "Data de Início", visible: true },
    { id: "totalOriginalEstimate", label: "Σ Estimativa Original", visible: true },
    { id: "totalTimeSpent", label: "Σ Tempo Gasto", visible: true },
    { id: "remainingEstimate", label: "Σ Estimativa Restante", visible: true }
  ];

  const calculateTotalTime = () => {
    const total = mockTasks.reduce((acc, task) => {
      return {
        min: acc.min + Number(task.originalEstimate || 0),
        med: acc.med + Number(task.totalTimeSpent || 0),
        max: acc.max + Number(task.remainingEstimate || 0)
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
