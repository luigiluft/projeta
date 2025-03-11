
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { Task } from "@/types/project";

export interface AutoAllocationProps {
  projectId: string;
  tasks: Task[];
  onSuccess?: () => void;
}

export function AutoAllocation({ projectId, tasks, onSuccess }: AutoAllocationProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    addDays(new Date(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    addDays(new Date(), 30)
  );
  
  const { autoAllocateTeam, loading } = useResourceAllocation(projectId);
  
  const handleAutoAllocation = async () => {
    if (!startDate || !endDate) {
      toast.error("Selecione as datas de início e término");
      return;
    }
    
    if (!tasks || tasks.length === 0) {
      toast.error("Nenhuma tarefa disponível para alocar");
      return;
    }
    
    try {
      const result = await autoAllocateTeam(
        projectId,
        tasks,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      
      if (result.success) {
        toast.success(`Alocação automática concluída. ${result.allocationsCreated} alocações criadas.`);
        if (onSuccess) onSuccess();
      } else {
        toast.error("Erro na alocação automática: " + result.message);
      }
    } catch (error: any) {
      console.error("Erro na alocação automática:", error);
      toast.error(error.message || "Erro ao realizar alocação automática");
    }
  };
  
  return (
    <div className="space-y-6 p-4 border rounded-md">
      <div>
        <h3 className="text-lg font-medium mb-4">Alocação Automática de Equipe</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Esta ferramenta irá tentar alocar automaticamente os membros da equipe às tarefas 
          do projeto, considerando suas disponibilidades e habilidades.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="start-date">Data de Início</Label>
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            disabled={(date) => date < new Date()}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end-date">Data de Término</Label>
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            disabled={(date) => date < new Date() || (startDate ? date < startDate : false)}
          />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={handleAutoAllocation} 
          disabled={!startDate || !endDate || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
              Alocando...
            </>
          ) : (
            "Alocar Automaticamente"
          )}
        </Button>
      </div>
    </div>
  );
}
