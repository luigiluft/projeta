
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Allocation } from "@/hooks/resourceAllocation/types";

interface AllocationFormProps {
  projectId: string;
  teamMembers: any[];
  tasks: any[];
  onSubmit: (data: Allocation) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const allocationFormSchema = z.object({
  member_id: z.string().min(1, "Selecione um membro da equipe"),
  task_id: z.string().optional(),
  start_date: z.string().min(1, "Selecione a data de início"),
  end_date: z.string().min(1, "Selecione a data de término"),
  allocated_hours: z.coerce.number().min(1, "Informe a quantidade de horas"),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"])
});

type AllocationFormValues = z.infer<typeof allocationFormSchema>;

export function AllocationForm({
  projectId,
  teamMembers,
  tasks,
  onSubmit,
  onCancel,
  isLoading = false
}: AllocationFormProps) {
  const [memberSelected, setMemberSelected] = useState<string>("");
  
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      member_id: "",
      task_id: "",
      start_date: "",
      end_date: "",
      allocated_hours: 0,
      status: "scheduled" as const
    }
  });

  const handleSubmit = (values: AllocationFormValues) => {
    onSubmit({
      project_id: projectId,
      member_id: values.member_id,
      task_id: values.task_id || null,
      start_date: values.start_date,
      end_date: values.end_date,
      allocated_hours: values.allocated_hours,
      status: values.status
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="member_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membro da Equipe</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setMemberSelected(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} ({member.position})
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
                <FormLabel>Tarefa (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma tarefa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Sem tarefa específica</SelectItem>
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione a data"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Término</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione a data"
                    disableBefore={form.watch("start_date")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="allocated_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas Alocadas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alocação"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
