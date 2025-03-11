
import { useState, useEffect } from "react";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { useProjectTasks } from "@/hooks/resourceAllocation/useProjectTasks";
import { useTeamMembers } from "@/hooks/resourceAllocation/useTeamMembers";
import { useAllocationMutations } from "@/hooks/resourceAllocation/useAllocationMutations";
import { FormLabel } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/datepicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Allocation } from "@/hooks/resourceAllocation/types";

interface AllocationFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function AllocationForm({ projectId, onSuccess }: AllocationFormProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [allocatedHours, setAllocatedHours] = useState<number>(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<"scheduled" | "in_progress" | "completed" | "cancelled">("scheduled");
  
  const { teamMembers, isLoading: loadingTeam } = useTeamMembers();
  const { tasks, isLoading: loadingTasks } = useProjectTasks(projectId);
  const { checkingAvailability } = useResourceAllocation();
  const { createAllocation, isCreating } = useAllocationMutations();
  
  // Reset formulário quando a tarefa mudar
  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        // Usar datas da tarefa se estiverem disponíveis
        if (task.start_date) setStartDate(task.start_date);
        if (task.end_date) setEndDate(task.end_date);
        
        // Definir horas alocadas com base nas horas calculadas da tarefa
        const taskHours = task.calculated_hours || 0;
        setAllocatedHours(taskHours);
      }
    }
  }, [selectedTaskId, tasks]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || allocatedHours <= 0 || !selectedMemberId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Verificar se a data final é posterior à data inicial
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("A data final deve ser posterior à data inicial");
      return;
    }
    
    const allocationData: Allocation = {
      project_id: projectId,
      member_id: selectedMemberId,
      task_id: selectedTaskId,
      start_date: startDate,
      end_date: endDate,
      allocated_hours: allocatedHours,
      status: status,
    };
    
    try {
      await createAllocation(allocationData);
      toast.success("Alocação criada com sucesso");
      
      // Limpar formulário
      setStartDate("");
      setEndDate("");
      setAllocatedHours(0);
      setSelectedMemberId("");
      setSelectedTaskId(null);
      setStatus("scheduled");
      
      // Notificar componente pai
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar alocação:", error);
      toast.error("Erro ao criar alocação");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-4">Nova Alocação</h3>
      
      <div className="space-y-4">
        <div>
          <FormLabel>Membro da Equipe</FormLabel>
          <Select
            value={selectedMemberId}
            onValueChange={setSelectedMemberId}
            disabled={loadingTeam}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um membro" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.first_name} {member.last_name} ({member.position})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <FormLabel>Tarefa (opcional)</FormLabel>
          <Select
            value={selectedTaskId || ""}
            onValueChange={value => setSelectedTaskId(value || null)}
            disabled={loadingTasks}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma tarefa (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem tarefa específica</SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.name || task.epic || task.story || `Tarefa ${task.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel>Data Inicial</FormLabel>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Data inicial"
            />
          </div>
          
          <div>
            <FormLabel>Data Final</FormLabel>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Data final"
              disableBefore={startDate}
            />
          </div>
        </div>
        
        <div>
          <FormLabel>Horas Alocadas</FormLabel>
          <Input
            type="number"
            min="1"
            step="1"
            value={allocatedHours}
            onChange={(e) => setAllocatedHours(parseInt(e.target.value) || 0)}
          />
        </div>
        
        <div>
          <FormLabel>Status</FormLabel>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "scheduled" | "in_progress" | "completed" | "cancelled")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Agendada</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isCreating || checkingAvailability}
      >
        {isCreating ? "Salvando..." : "Salvar Alocação"}
      </Button>
    </form>
  );
}
