import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/project";
import { CalendarIcon, PlusCircle, Trash2, RefreshCw, Wand2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useResourceAllocation } from "@/hooks/useResourceAllocation";
import { useAutoAllocation } from "@/hooks/useAutoAllocation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AllocationTabProps {
  tasks: Task[];
  projectId?: string;
}

// Schema para o formulário de alocação
const allocationFormSchema = z.object({
  task_id: z.string().optional(),
  member_id: z.string({ required_error: "Selecione um membro da equipe" }),
  start_date: z.date({ required_error: "Data de início é obrigatória" }),
  end_date: z.date({ required_error: "Data de fim é obrigatória" }),
  allocated_hours: z.coerce.number().min(1, "Deve alocar pelo menos 1 hora"),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"], {
    required_error: "Selecione um status",
  }),
});

type AllocationFormValues = z.infer<typeof allocationFormSchema>;

export function AllocationTab({ tasks, projectId }: AllocationTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoAllocateDialogOpen, setAutoAllocateDialogOpen] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);

  const {
    teamMembers,
    allocations,
    loading,
    loadingTeam,
    loadingAllocations,
    getAvailability,
    allocateResource,
    deleteAllocation,
    suggestProjectDates,
  } = useResourceAllocation(projectId);

  const { loading: autoAllocLoading, autoAllocateTeam } = useAutoAllocation();

  const implementationTasks = tasks.filter(task => 
    !task.epic.toLowerCase().includes('sustentação') &&
    !task.epic.toLowerCase().includes('sustentacao')
  );

  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      task_id: undefined,
      member_id: "",
      start_date: new Date(),
      end_date: new Date(),
      allocated_hours: 8,
      status: "scheduled",
    },
  });

  // Função para realizar alocação automática
  const handleAutoAllocate = async () => {
    if (!projectId || tasks.length === 0) {
      toast.error("Projeto ou tarefas não encontrados");
      return;
    }

    try {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

      const result = await autoAllocateTeam(
        projectId,
        tasks,
        startDate,
        endDate
      );

      // Fechar diálogo e atualizar lista de alocações
      setAutoAllocateDialogOpen(false);
      
      // Mostrar resultados
      if (result.allocatedCount > 0) {
        toast.success(`${result.allocatedCount} tarefas alocadas automaticamente`);
      }
      
      if (result.notAllocatedCount > 0) {
        toast.warning(`${result.notAllocatedCount} tarefas não puderam ser alocadas automaticamente`);
      }
      
      // Atualizar lista de alocações
      // useResourceAllocation deve ter uma função de refetch que pode ser chamada aqui
    } catch (error) {
      console.error("Erro na alocação automática:", error);
      toast.error("Erro ao realizar alocação automática");
    }
  };

  // Função para consultar a disponibilidade
  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      
      const values = form.getValues();
      if (!values.start_date || !values.end_date) {
        toast.error("Selecione as datas para verificar disponibilidade");
        return;
      }
      
      // Formatar datas
      const startDate = format(values.start_date, 'yyyy-MM-dd');
      const endDate = format(values.end_date, 'yyyy-MM-dd');
      
      // Se um membro específico foi selecionado
      const memberIds = values.member_id ? [values.member_id] : [];
      
      // Buscar disponibilidade
      const availability = await getAvailability(
        startDate, 
        endDate, 
        values.allocated_hours,
        memberIds
      );
      
      setAvailabilityData(availability);
      
      // Se não houver resultados
      if (availability.length === 0) {
        toast.error("Nenhum membro disponível no período selecionado");
      } else {
        toast.success("Disponibilidade consultada com sucesso");
      }
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
      toast.error("Erro ao verificar disponibilidade");
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Função para abrir diálogo para editar alocação
  const editAllocation = (allocation: any) => {
    setEditingAllocationId(allocation.id);
    
    form.reset({
      task_id: allocation.task_id || undefined,
      member_id: allocation.member_id,
      start_date: new Date(allocation.start_date),
      end_date: new Date(allocation.end_date),
      allocated_hours: allocation.allocated_hours,
      status: allocation.status,
    });
    
    setDialogOpen(true);
  };

  // Função para remover alocação
  const handleDeleteAllocation = async (id: string) => {
    if (confirm("Tem certeza que deseja remover esta alocação?")) {
      try {
        await deleteAllocation(id);
      } catch (error) {
        console.error("Erro ao excluir alocação:", error);
      }
    }
  };

  // Função para sugerir datas para o projeto
  const handleSuggestDates = async () => {
    if (!projectId) return;
    
    try {
      const values = form.getValues();
      
      // Calcular total de horas das tarefas
      const totalHours = implementationTasks.reduce((sum, task) => {
        return sum + (task.calculated_hours || task.fixed_hours || 0);
      }, 0);
      
      const suggestion = await suggestProjectDates(
        totalHours,
        1, // Quantidade de membros a serem alocados simultaneamente
        format(new Date(), 'yyyy-MM-dd')
      );
      
      if (suggestion) {
        form.setValue('start_date', new Date(suggestion.start_date));
        form.setValue('end_date', new Date(suggestion.end_date));
        toast.success("Datas sugeridas com base na disponibilidade da equipe");
      } else {
        toast.error("Não foi possível sugerir datas");
      }
    } catch (error) {
      console.error("Erro ao sugerir datas:", error);
      toast.error("Erro ao sugerir datas para o projeto");
    }
  };

  const onSubmit = async (values: AllocationFormValues) => {
    if (!projectId) {
      toast.error("ID do projeto não encontrado");
      return;
    }
    
    try {
      const allocationData = {
        id: editingAllocationId || undefined,
        project_id: projectId,
        member_id: values.member_id,
        task_id: values.task_id,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
        allocated_hours: values.allocated_hours,
        status: values.status,
      };
      
      await allocateResource(allocationData);
      
      // Resetar form e fechar diálogo
      form.reset();
      setDialogOpen(false);
      setEditingAllocationId(null);
      setAvailabilityData([]);
    } catch (error) {
      console.error("Erro ao salvar alocação:", error);
    }
  };

  // Resetar form quando o diálogo for fechado
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingAllocationId(null);
      setAvailabilityData([]);
    }
    setDialogOpen(open);
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Alocações de Recursos</h3>
        
        <div className="flex items-center gap-2">
          <Dialog open={autoAllocateDialogOpen} onOpenChange={setAutoAllocateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Alocação Automática
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Alocação Automática de Recursos</DialogTitle>
                <DialogDescription>
                  O sistema irá alocar automaticamente membros da equipe para as tarefas com base na correspondência entre o cargo do responsável da tarefa e os cargos dos membros da equipe disponíveis.
                </DialogDescription>
              </DialogHeader>
              
              <Alert className="mt-4">
                <AlertTitle>Como funciona a alocação automática?</AlertTitle>
                <AlertDescription className="text-sm">
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Para cada tarefa, o sistema buscará membros com o cargo correspondente ao responsável da tarefa</li>
                    <li>Serão verificadas as disponibilidades de cada membro no período</li>
                    <li>As tarefas serão alocadas para os membros com capacidade disponível</li>
                    <li>Tarefas sem responsável definido não serão alocadas</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setAutoAllocateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAutoAllocate} disabled={autoAllocLoading}>
                  {autoAllocLoading ? "Alocando..." : "Alocar Automaticamente"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Nova Alocação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAllocationId ? "Editar Alocação" : "Nova Alocação de Recurso"}
                </DialogTitle>
                <DialogDescription>
                  Aloque membros da equipe para tarefas específicas do projeto.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="task_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarefa (Opcional)</FormLabel>
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
                            {implementationTasks.map(task => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.task_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Associe esta alocação a uma tarefa específica.
                        </FormDescription>
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "pl-3 text-left font-normal flex justify-between items-center"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Fim</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "pl-3 text-left font-normal flex justify-between items-center"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const startDate = form.getValues("start_date");
                                  return date < startDate;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleSuggestDates}
                      disabled={!projectId || implementationTasks.length === 0}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sugerir Datas
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={checkAvailability}
                    >
                      Verificar Disponibilidade
                    </Button>
                  </div>
                  
                  {availabilityData.length > 0 && (
                    <Alert>
                      <AlertTitle>Membros Disponíveis</AlertTitle>
                      <AlertDescription>
                        <ScrollArea className="h-32 mt-2">
                          <div className="space-y-2">
                            {availabilityData.map(member => (
                              <div key={member.member_id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                                <div>
                                  <p className="font-medium">{member.member_name}</p>
                                  <p className="text-sm text-gray-500">{member.position}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => form.setValue('member_id', member.member_id)}
                                >
                                  Selecionar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="member_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membro da Equipe</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um membro" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamMembers.map(member => (
                              <SelectItem 
                                key={member.id} 
                                value={member.id}
                              >
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
                    name="allocated_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas Alocadas</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            min={1}
                          />
                        </FormControl>
                        <FormDescription>
                          Total de horas alocadas para o período.
                        </FormDescription>
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
                            <SelectItem value="scheduled">Agendada</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : "Salvar Alocação"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {loadingAllocations ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : allocations && allocations.length > 0 ? (
        <div className="space-y-4">
          {allocations.map((allocation: any) => (
            <Card key={allocation.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{allocation.member_name}</h4>
                    <p className="text-sm text-gray-500">
                      {allocation.task_name ? allocation.task_name : "Alocação Geral"}
                    </p>
                  </div>
                  
                  <Badge className={
                    allocation.status === 'scheduled' ? 'bg-blue-500' :
                    allocation.status === 'in_progress' ? 'bg-yellow-500' :
                    allocation.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                  }>
                    {allocation.status === 'scheduled' ? 'Agendada' :
                     allocation.status === 'in_progress' ? 'Em Andamento' :
                     allocation.status === 'completed' ? 'Concluída' : 'Cancelada'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="p-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {format(new Date(allocation.start_date), "dd/MM/yyyy", { locale: ptBR })} -&nbsp;
                        {format(new Date(allocation.end_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{allocation.allocated_hours}</span> horas alocadas
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => editAllocation(allocation)}
                    >
                      Editar
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteAllocation(allocation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border rounded-md p-8 bg-gray-50">
          <p className="text-gray-500 mb-4">Nenhuma alocação de recursos definida</p>
          <Button 
            variant="outline" 
            onClick={() => setDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Alocação
          </Button>
        </div>
      )}
    </div>
  );
}
