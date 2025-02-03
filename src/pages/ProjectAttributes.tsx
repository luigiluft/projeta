import { useState } from "react";
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
import { Header } from "@/components/Layout/Header";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Pencil, Trash2, Plus, FilePlus } from "lucide-react";
import { ColumnManager } from "@/components/ProjectAttributes/ColumnManager";
import { ViewManager } from "@/components/ProjectAttributes/ViewManager";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  unit: z.enum(["hours", "quantity", "percentage"]),
  type: z.enum(["number", "list", "text"]),
  defaultValue: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Attribute = FormValues & {
  id: string;
};

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

export default function ProjectAttributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "unit", label: "Unidade", visible: true },
    { id: "type", label: "Tipo", visible: true },
    { id: "defaultValue", label: "Valor Padrão", visible: true },
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      unit: "hours",
      type: "number",
      defaultValue: "",
    },
  });

  function onSubmit(values: FormValues) {
    if (editingId) {
      setAttributes(attributes.map(attr => 
        attr.id === editingId ? { ...values, id: editingId } : attr
      ));
      setEditingId(null);
      toast.success("Atributo atualizado com sucesso!");
    } else {
      const newAttribute: Attribute = {
        ...values,
        id: Math.random().toString(36).substr(2, 9),
      };
      setAttributes([...attributes, newAttribute]);
      toast.success("Atributo criado com sucesso!");
    }
    form.reset();
  }

  const handleEdit = (attribute: Attribute) => {
    setEditingId(attribute.id);
    form.reset({
      name: attribute.name,
      unit: attribute.unit,
      type: attribute.type,
      defaultValue: attribute.defaultValue,
    });
  };

  const handleDelete = (id: string) => {
    setAttributes(attributes.filter(attr => attr.id !== id));
    toast.success("Atributo removido com sucesso!");
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    const newView = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: columns.filter(col => col.visible).map(col => col.id),
    };
    setSavedViews([...savedViews, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(columns.map(col => ({
      ...col,
      visible: view.columns.includes(col.id),
    })));
  };

  const handleImportSpreadsheet = () => {
    // Implement spreadsheet import logic here
    console.log("Import spreadsheet clicked");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestão de Atributos do Projeto</h1>
              <div className="flex items-center gap-4">
                <ColumnManager
                  columns={columns}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                />
                <ViewManager
                  onSaveView={handleSaveView}
                  onLoadView={handleLoadView}
                  savedViews={savedViews}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Atributo
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-lg">
                    <DropdownMenuItem onClick={() => form.reset()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Atributo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportSpreadsheet}>
                      <FilePlus className="mr-2 h-4 w-4" />
                      Importar Planilha
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow mb-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Atributo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do atributo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de Medida</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a unidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hours">Horas</SelectItem>
                            <SelectItem value="quantity">Quantidade</SelectItem>
                            <SelectItem value="percentage">Percentual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Entrada</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="number">Numérico</SelectItem>
                            <SelectItem value="list">Lista de Opções</SelectItem>
                            <SelectItem value="text">Texto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="defaultValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Padrão (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o valor padrão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {editingId ? "Atualizar Atributo" : "Criar Novo Atributo"}
                </Button>
              </form>
            </Form>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Atributos Cadastrados</h2>
                <div className="space-y-4">
                  {attributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        {columns.find(col => col.id === "name")?.visible && (
                          <h3 className="font-medium">{attribute.name}</h3>
                        )}
                        <p className="text-sm text-gray-500">
                          {columns.find(col => col.id === "type")?.visible && attribute.type}
                          {columns.find(col => col.id === "unit")?.visible && ` | ${attribute.unit}`}
                          {columns.find(col => col.id === "defaultValue")?.visible && 
                            attribute.defaultValue && ` | Padrão: ${attribute.defaultValue}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(attribute)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(attribute.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
