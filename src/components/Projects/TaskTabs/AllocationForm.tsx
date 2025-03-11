
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { format } from "date-fns";
import { toast } from "sonner";

interface AllocationFormProps {
  projectId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  member_id: z.string({ required_error: "Selecione um membro da equipe" }),
  task_id: z.string({ required_error: "Selecione uma tarefa" }),
  start_date: z.date({ required_error: "Selecione uma data de início" }),
  end_date: z.date({ required_error: "Selecione uma data de término" }),
  allocated_hours: z.coerce.number().min(1, "Informe pelo menos 1 hora"),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"], {
    required_error: "Selecione um status"
  }),
});

export function AllocationForm({ projectId, onSuccess }: AllocationFormProps) {
  const { teamMembers, projectTasks, loading, createAllocation } = useResourceAllocation(projectId);
  const members = teamMembers.data || [];
  const tasks = projectTasks.data || [];
  
  const isSubmitting = loading || createAllocation.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "scheduled",
      allocated_hours: 8,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createAllocation.mutateAsync({
        project_id: projectId,
        member_id: values.member_id,
        task_id: values.task_id,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
        allocated_hours: values.allocated_hours,
        status: values.status,
      });
      
      toast.success("Alocação criada com sucesso");
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Erro ao criar alocação:", error);
      toast.error(error.message || "Erro ao criar alocação");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="member_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Membro da Equipe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="task_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarefa</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma tarefa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.task_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  disabled={(date) => date < new Date()}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Término</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  disabled={(date) => {
                    const startDate = form.getValues('start_date');
                    return startDate && date < startDate;
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="allocated_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horas Alocadas</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
              Criando...
            </>
          ) : (
            "Criar Alocação"
          )}
        </Button>
      </form>
    </Form>
  );
}
