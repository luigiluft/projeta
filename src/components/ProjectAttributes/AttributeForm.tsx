
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
import { ProjectAttribute } from "@/types/database";

const formSchema = z.object({
  project_id: z.string(),
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  value: z.string(),
  unit: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AttributeFormProps {
  editingId: string | null;
  onSubmit: (values: FormValues) => void;
  initialValues?: ProjectAttribute;
}

export function AttributeForm({ editingId, onSubmit, initialValues }: AttributeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_id: initialValues?.project_id || '11111111-1111-1111-1111-111111111111',
      name: initialValues?.name || "",
      value: initialValues?.value || "",
      unit: initialValues?.unit || "quantity",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
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

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input placeholder="Digite o valor do atributo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="quantity">Quantidade</SelectItem>
                  <SelectItem value="currency">Moeda</SelectItem>
                  <SelectItem value="percentage">Percentual</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                  <SelectItem value="minutes">Minutos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">
            {editingId ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
