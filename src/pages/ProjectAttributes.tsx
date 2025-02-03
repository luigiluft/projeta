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
import { toast } from "@/components/ui/use-toast";
import { Pencil, Trash2 } from "lucide-react";

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

export default function ProjectAttributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      toast({
        title: "Atributo atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      const newAttribute: Attribute = {
        ...values,
        id: Math.random().toString(36).substr(2, 9),
      };
      setAttributes([...attributes, newAttribute]);
      toast({
        title: "Atributo criado!",
        description: "O novo atributo foi adicionado com sucesso.",
      });
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
    toast({
      title: "Atributo removido!",
      description: "O atributo foi removido com sucesso.",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Gestão de Atributos do Projeto</h1>
            
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
                        <h3 className="font-medium">{attribute.name}</h3>
                        <p className="text-sm text-gray-500">
                          {attribute.type} | {attribute.unit}
                          {attribute.defaultValue && ` | Padrão: ${attribute.defaultValue}`}
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