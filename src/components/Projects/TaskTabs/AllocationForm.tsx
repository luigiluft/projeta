
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { format, addDays, addBusinessDays, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { toast } from "sonner";
import { Allocation } from "@/hooks/resourceAllocation/types";

export interface AllocationFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function AllocationForm({ projectId, onSuccess }: AllocationFormProps) {
  const [memberId, setMemberId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [allocatedHours, setAllocatedHours] = useState<number>(0);
  
  const {
    teamMembers: teamMembersQuery,
    projectTasks: projectTasksQuery,
    loading,
    createAllocation
  } = useResourceAllocation(projectId);
  
  const teamMembers = teamMembersQuery.data || [];
  const tasks = projectTasksQuery.data || [];
  
  const handleMemberChange = (value: string) => {
    setMemberId(value);
  };
  
  const handleTaskChange = (value: string) => {
    setTaskId(value);
    
    // Get task hours if available
    const selectedTask = tasks.find(t => t.id === value);
    if (selectedTask) {
      const taskHours = selectedTask.calculated_hours || selectedTask.fixed_hours || 0;
      setAllocatedHours(taskHours);
    }
  };
  
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    
    // Automatically set end date based on allocated hours
    if (date) {
      // Basic calculation: add work days based on hours (8h per day)
      const daysNeeded = Math.ceil(allocatedHours / 8);
      let endDate = date;
      
      for (let i = 0; i < daysNeeded; i++) {
        endDate = addDays(endDate, 1);
        // Skip weekends
        if (isWeekend(endDate)) {
          endDate = addDays(endDate, 1);
          if (isWeekend(endDate)) {
            endDate = addDays(endDate, 1);
          }
        }
      }
      
      setEndDate(endDate);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberId || !startDate || !endDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    const allocation: Allocation = {
      project_id: projectId,
      member_id: memberId,
      task_id: taskId || null,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      allocated_hours: allocatedHours,
      status: 'scheduled'
    };
    
    createAllocation(allocation, {
      onSuccess: () => {
        toast.success("Alocação criada com sucesso");
        // Reset form
        setMemberId("");
        setTaskId("");
        setStartDate(null);
        setEndDate(null);
        setAllocatedHours(0);
        
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: any) => {
        console.error("Erro ao criar alocação:", error);
        toast.error(error.message || "Erro ao criar alocação");
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="member">Membro da Equipe</Label>
        <Select value={memberId} onValueChange={handleMemberChange}>
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
      
      <div className="space-y-2">
        <Label htmlFor="task">Tarefa (opcional)</Label>
        <Select value={taskId} onValueChange={handleTaskChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma tarefa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem tarefa específica</SelectItem>
            {tasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.task_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Início</Label>
          <DatePicker
            selected={startDate}
            onSelect={handleStartDateChange}
            placeholderText="Selecione a data"
            minDate={new Date()}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Término</Label>
          <DatePicker
            selected={endDate}
            onSelect={setEndDate}
            placeholderText="Selecione a data"
            minDate={startDate || new Date()}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hours">Horas Alocadas</Label>
        <Input
          id="hours"
          type="number"
          min="1"
          value={allocatedHours}
          onChange={(e) => setAllocatedHours(Number(e.target.value))}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Criando..." : "Criar Alocação"}
      </Button>
    </form>
  );
}
