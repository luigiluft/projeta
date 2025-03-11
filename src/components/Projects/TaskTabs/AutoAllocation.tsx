
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useAutoAllocation } from "@/hooks/useAutoAllocation";
import { toast } from "sonner";
import { Task } from "@/types/project";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AutoAllocationProps {
  tasks: Task[];
  projectId?: string;
  onSuccess?: () => void;
}

export function AutoAllocation({ tasks, projectId, onSuccess }: AutoAllocationProps) {
  const [isAllocating, setIsAllocating] = useState(false);
  const { autoAllocateTeam } = useAutoAllocation();

  const handleAutoAllocate = async () => {
    if (!projectId) {
      toast.error("ID do projeto não disponível");
      return;
    }

    if (tasks.length === 0) {
      toast.error("Não há tarefas para alocar");
      return;
    }

    // Verificar se há tarefas sem responsável
    const tasksWithoutOwner = tasks.filter(task => !task.owner);
    if (tasksWithoutOwner.length > 0) {
      toast.warning(`${tasksWithoutOwner.length} tarefas não possuem responsável definido e não serão alocadas`);
    }

    // Agrupar tarefas por responsável para feedback
    const roleGroups = tasks.reduce((acc, task) => {
      if (task.owner) {
        if (!acc[task.owner]) {
          acc[task.owner] = [];
        }
        acc[task.owner].push(task);
      }
      return acc;
    }, {} as Record<string, Task[]>);

    console.log("Distribuição de tarefas por responsável:", 
      Object.entries(roleGroups).map(([role, tasks]) => `${role}: ${tasks.length} tarefas`));

    setIsAllocating(true);
    
    try {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];
      
      const result = await autoAllocateTeam(projectId, tasks, startDate, endDate);
      
      if (result.allocatedCount > 0) {
        toast.success(`${result.allocatedCount} cargos alocados com sucesso`);
        if (onSuccess) onSuccess();
      } else {
        toast.warning("Não foi possível realizar alocações automáticas");
      }
      
      if (result.notAllocatedCount > 0) {
        toast.warning(`Não foi possível alocar tarefas para ${result.notAllocatedRoles.length} cargos`);
        console.log("Cargos não alocados:", result.notAllocatedRoles.join(", "));
      }
    } catch (error) {
      console.error("Erro na alocação automática:", error);
      toast.error("Erro ao realizar alocação automática");
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="mb-6">
      <Alert>
        <Wand2 className="h-4 w-4" />
        <AlertTitle>Alocação Automática</AlertTitle>
        <AlertDescription>
          A alocação automática distribui as tarefas entre os membros da equipe disponíveis,
          com base em seus cargos e capacidade. Cada responsável terá todas suas tarefas alocadas
          para um membro da equipe do mesmo cargo.
        </AlertDescription>
      </Alert>
      <div className="mt-4">
        <Button 
          onClick={handleAutoAllocate} 
          disabled={isAllocating || !projectId || tasks.length === 0}
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isAllocating ? "Alocando..." : "Alocar Automaticamente"}
        </Button>
      </div>
    </div>
  );
}
