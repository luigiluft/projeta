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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  type: z.enum(["epic", "story", "task"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["backlog", "in_progress", "done"]),
  timeMin: z.string(),
  timeMed: z.string(),
  timeMax: z.string(),
  dependencies: z.string(),
  responsible: z.string(),
  timeFormula: z.string(),
});

interface TaskFormProps {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskForm({ onSubmit, open, onOpenChange }: TaskFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "task",
      priority: "medium",
      status: "backlog",
      timeMin: "",
      timeMed: "",
      timeMax: "",
      dependencies: "",
      responsible: "",
      timeFormula: "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit?.(values);
    toast.success("Item criado com sucesso!");
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow mb-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite a descrição" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="epic">Épico</SelectItem>
                    <SelectItem value="story">História</SelectItem>
                    <SelectItem value="task">Tarefa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="timeMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo Mínimo (h)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeMed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo Médio (h)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo Máximo (h)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dependencies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dependências</FormLabel>
              <FormControl>
                <Input placeholder="Digite as dependências" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeFormula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fórmula de Tempo</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite a fórmula personalizada para cálculo do tempo"
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

Now let's update the TaskManagement page to match:

<lov-write file_path="src/pages/TaskManagement.tsx">
import { useState } from "react";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";

interface Task {
  id: string;
  name: string;
  type: "epic" | "story" | "task";
  priority: "low" | "medium" | "high" | "urgent";
  status: "backlog" | "in_progress" | "done";
  responsible: string;
  timeMin: string;
  timeMed: string;
  timeMax: string;
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface View {
  id: string;
  name: string;
  columns: string[];
}

export default function TaskManagement() {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "priority", label: "Prioridade", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "responsible", label: "Responsável", visible: true },
    { id: "timeMin", label: "Tempo Mínimo", visible: true },
    { id: "timeMed", label: "Tempo Médio", visible: true },
    { id: "timeMax", label: "Tempo Máximo", visible: true },
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  const handleNewTask = () => {
    setShowForm(true);
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSaveView = () => {
    console.log("Save view clicked");
  };

  const handleLoadView = (view: View) => {
    console.log("Load view clicked", view);
  };

  const handleTaskSubmit = (values: any) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...values
    };
    setTasks([...tasks, newTask]);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
        <ActionButtons
          columns={columns}
          savedViews={savedViews}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Nova Tarefa"
          data={tasks}
          exportFilename="tarefas"
        />
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskForm 
              onSubmit={handleTaskSubmit}
              open={showForm}
              onOpenChange={setShowForm}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskList tasks={tasks} columns={columns} />
          </div>
        </div>
      )}
    </div>
  );
}
