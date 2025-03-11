
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/datepicker";
import { addDays, format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAutoAllocation } from "@/hooks/useAutoAllocation";
import { toast } from "sonner";
import { Task } from "@/types/project";

export interface AutoAllocationProps {
  projectId: string;
  onSuccess?: () => void;
  tasks: Task[];
}

const autoAllocationSchema = z.object({
  startDate: z.date({ required_error: "Data de início é obrigatória" }),
  distributeEvenly: z.boolean().default(true),
  prioritizeDueDate: z.boolean().default(false),
  respectRoles: z.boolean().default(true),
  includeWeekends: z.boolean().default(false),
});

type AutoAllocationFormValues = z.infer<typeof autoAllocationSchema>;

export function AutoAllocation({ projectId, onSuccess, tasks }: AutoAllocationProps) {
  const [allocating, setAllocating] = useState(false);
  const { allocateAutomatically } = useAutoAllocation();
  
  const form = useForm<AutoAllocationFormValues>({
    resolver: zodResolver(autoAllocationSchema),
    defaultValues: {
      startDate: addDays(new Date(), 1),
      distributeEvenly: true,
      prioritizeDueDate: false,
      respectRoles: true,
      includeWeekends: false,
    },
  });
  
  const hasTasks = tasks && tasks.length > 0;
  
  const onSubmit = async (values: AutoAllocationFormValues) => {
    if (!hasTasks) {
      toast.error("Não há tarefas disponíveis para alocar");
      return;
    }
    
    try {
      setAllocating(true);
      
      const params = {
        projectId,
        startDate: format(values.startDate, 'yyyy-MM-dd'),
        distributeEvenly: values.distributeEvenly,
        prioritizeDueDate: values.prioritizeDueDate,
        respectRoles: values.respectRoles,
        includeWeekends: values.includeWeekends,
      };
      
      await allocateAutomatically(params);
      
      toast.success("Alocação automática concluída com sucesso!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro na alocação automática:", error);
      toast.error("Erro ao realizar alocação automática. Tente novamente.");
    } finally {
      setAllocating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Alocação Automática</h3>
      
      {!hasTasks && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Não há tarefas disponíveis para alocar automaticamente.
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    minDate={new Date()}
                    disabled={allocating || !hasTasks}
                  />
                </FormControl>
                <FormDescription>
                  A alocação será feita a partir desta data
                </FormDescription>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="distributeEvenly"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Distribuir Uniformemente</FormLabel>
                    <FormDescription>
                      Tenta balancear a carga de trabalho entre membros da equipe
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={allocating || !hasTasks}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="prioritizeDueDate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Priorizar por Prazo</FormLabel>
                    <FormDescription>
                      Aloca primeiro tarefas com prazos mais próximos
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={allocating || !hasTasks}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="respectRoles"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Respeitar Papéis</FormLabel>
                    <FormDescription>
                      Aloca tarefas apenas para membros com o papel requerido
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={allocating || !hasTasks}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="includeWeekends"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Incluir Finais de Semana</FormLabel>
                    <FormDescription>
                      Permite alocação em sábados e domingos
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={allocating || !hasTasks}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={allocating || !hasTasks}
          >
            {allocating ? "Alocando..." : "Alocar Automaticamente"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
