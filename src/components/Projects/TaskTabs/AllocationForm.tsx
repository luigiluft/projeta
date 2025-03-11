
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

export interface AllocationFormProps {
  projectId: string;
  onSuccess?: () => void;
}

const allocationSchema = z.object({
  member_id: z.string().min(1, { message: "Selecione um membro da equipe" }),
  task_id: z.string().min(1, { message: "Selecione uma tarefa" }),
  start_date: z.date({ required_error: "Selecione uma data de início" }),
  end_date: z.date({ required_error: "Selecione uma data de término" }),
  allocated_hours: z.coerce.number().min(1, { message: "Defina as horas alocadas" }),
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

export function AllocationForm({ projectId, onSuccess }: AllocationFormProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  
  const { teamMembers, projectTasks, createAllocation, loading } = useResourceAllocation(projectId);
  
  const isCreating = loading;
  const teamMemberOptions = teamMembers.data || [];
  const taskOptions = projectTasks.data || [];
  
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      member_id: "",
      task_id: "",
      allocated_hours: 8,
    },
  });
  
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    
    if (date) {
      form.setValue("start_date", date);
      
      // Define end_date como startDate + 5 dias úteis por padrão
      const endDate = addDays(date, 5);
      form.setValue("end_date", endDate);
    }
  };
  
  const onSubmit = async (values: AllocationFormValues) => {
    try {
      const allocation = {
        project_id: projectId,
        member_id: values.member_id,
        task_id: values.task_id,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
        allocated_hours: values.allocated_hours,
        status: 'active',
      };
      
      console.log("Enviando alocação:", allocation);
      
      await createAllocation.mutateAsync(allocation);
      
      toast.success("Alocação criada com sucesso!");
      form.reset();
      setStartDate(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar alocação:", error);
      toast.error("Erro ao criar alocação. Tente novamente.");
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="member_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membro da Equipe</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isCreating}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teamMemberOptions.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.position})
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
                <Select onValueChange={field.onChange} value={field.value} disabled={isCreating}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma tarefa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {taskOptions.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.name || task.story} ({task.owner})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    minDate={new Date()}
                    disabled={isCreating}
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
                    selected={field.value}
                    onSelect={field.onChange}
                    minDate={startDate ? addDays(startDate, 1) : undefined}
                    disabled={!startDate || isCreating}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="allocated_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas Alocadas</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    disabled={isCreating}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Criando..." : "Criar Alocação"}
        </Button>
      </form>
    </Form>
  );
}
