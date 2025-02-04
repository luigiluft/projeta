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
  attributes: {
    [key: string]: string | number;
  };
}

interface ProjectFormProps {
  editingId: string | null;
  attributes: Attribute[];
  onSubmit: (values: any) => void;
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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: "",
      ...Object.fromEntries(
        attributes.map((attr) => [attr.id, attr.defaultValue || ""])
      ),
    },
  });

  const handleSubmit = (values: any) => {
    onSubmit(values);
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

        {attributes.map((attribute) => (
          <FormField
            key={attribute.id}
            control={form.control}
            name={attribute.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{attribute.name}</FormLabel>
                <FormControl>
                  <Input
                    type={attribute.type === "number" ? "number" : "text"}
                    placeholder={`Digite ${attribute.name.toLowerCase()}`}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        attribute.type === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" className="w-full">
          {editingId ? "Atualizar Projeto" : "Criar Novo Projeto"}
        </Button>
      </form>
    </Form>
  );
}