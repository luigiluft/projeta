
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "./TeamList";

const teamMemberSchema = z.object({
  first_name: z.string().min(2, "Nome é obrigatório"),
  last_name: z.string().min(2, "Sobrenome é obrigatório"),
  position: z.string().min(1, "Cargo é obrigatório"),
  hourly_rate: z.coerce.number().min(0, "Valor por hora deve ser maior que 0"),
  email: z.string().email("Email inválido"),
  department: z.string().min(1, "Departamento é obrigatório"),
  status: z.enum(["active", "inactive"]),
  squad: z.string().optional(),
});

interface TeamFormProps {
  initialValues?: TeamMember;
  onClose: () => void;
}

export function TeamForm({ initialValues, onClose }: TeamFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialValues;

  const form = useForm<z.infer<typeof teamMemberSchema>>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      first_name: initialValues?.first_name || "",
      last_name: initialValues?.last_name || "",
      position: initialValues?.position || "",
      hourly_rate: initialValues?.hourly_rate || 0,
      email: initialValues?.email || "",
      department: initialValues?.department || "",
      status: (initialValues?.status as "active" | "inactive") || "active",
      squad: initialValues?.squad || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof teamMemberSchema>) => {
    try {
      setLoading(true);

      if (isEditing && initialValues?.id) {
        // Atualizar membro existente
        const { error } = await supabase
          .from('team_members')
          .update(values)
          .eq('id', initialValues.id);

        if (error) throw error;
        toast.success("Membro da equipe atualizado com sucesso");
      } else {
        // Criar novo membro
        const { error } = await supabase
          .from('team_members')
          .insert(values);

        if (error) throw error;
        toast.success("Membro da equipe criado com sucesso");
      }

      // Limpar formulário e fechar
      form.reset();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar membro da equipe:", error);
      toast.error(isEditing ? "Erro ao atualizar membro" : "Erro ao criar membro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrenome</FormLabel>
                <FormControl>
                  <Input placeholder="Sobrenome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BK">Backend (BK)</SelectItem>
                      <SelectItem value="DS">Design (DS)</SelectItem>
                      <SelectItem value="PMO">Gerente de Projeto (PMO)</SelectItem>
                      <SelectItem value="PO">Product Owner (PO)</SelectItem>
                      <SelectItem value="CS">Suporte (CS)</SelectItem>
                      <SelectItem value="FRJ">Frontend Junior (FRJ)</SelectItem>
                      <SelectItem value="FRP">Frontend Pleno (FRP)</SelectItem>
                      <SelectItem value="BKT">Backend Senior (BKT)</SelectItem>
                      <SelectItem value="ATS">Analista (ATS)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <FormControl>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Gestão">Gestão</SelectItem>
                      <SelectItem value="Produto">Produto</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                      <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Análise">Análise</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourly_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Hora</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="squad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Squad</FormLabel>
                <FormControl>
                  <Input placeholder="Squad (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
