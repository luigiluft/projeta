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

interface Attribute extends FormValues {
  id: string;
}

interface AttributeFormProps {
  editingId: string | null;
  onSubmit: (values: FormValues) => void;
  initialValues?: Attribute;
}

export function AttributeForm({ editingId, onSubmit, initialValues }: AttributeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: "",
      unit: "hours",
      type: "number",
      defaultValue: "",
    },
  });

  return (
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
  );
}