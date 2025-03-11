
import { useState } from "react";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarRange, Timer, User, FileCode, Trash2 } from "lucide-react";
import { TeamAllocation } from "@/hooks/resourceAllocation/types";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export interface AllocationListProps {
  projectId: string;
  onAllocationDeleted: () => void;
}

export function AllocationList({ projectId, onAllocationDeleted }: AllocationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { projectAllocations, teamMembers, projectTasks, deleteAllocation } = useResourceAllocation(projectId);
  
  const isLoading = projectAllocations.isLoading || teamMembers.isLoading || projectTasks.isLoading;
  const allocations = projectAllocations.data || [];
  const members = teamMembers.data || [];
  const tasks = projectTasks.data || [];
  
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteAllocation.mutateAsync(id);
      toast.success("Alocação excluída com sucesso");
      onAllocationDeleted();
    } catch (error) {
      console.error("Erro ao excluir alocação:", error);
      toast.error("Erro ao excluir alocação");
    } finally {
      setDeletingId(null);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-6">Carregando alocações...</div>;
  }
  
  if (allocations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-md">
        Nenhuma alocação encontrada para este projeto.
      </div>
    );
  }
  
  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : "Membro desconhecido";
  };
  
  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? (task.name || task.story || "Tarefa #" + task.id) : "Tarefa desconhecida";
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM", { locale: ptBR });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Alocações Atuais</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allocations.map((allocation: TeamAllocation) => (
          <Card key={allocation.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-start">
                <span className="truncate">{getMemberName(allocation.member_id)}</span>
                <Badge variant={allocation.status === 'active' ? 'default' : 'outline'}>
                  {allocation.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2 space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <FileCode className="h-4 w-4 mr-2" />
                <span className="truncate">{getTaskName(allocation.task_id)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarRange className="h-4 w-4 mr-2" />
                <span>{formatDate(allocation.start_date)} - {formatDate(allocation.end_date)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Timer className="h-4 w-4 mr-2" />
                <span>{allocation.allocated_hours} horas alocadas</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingId === allocation.id ? "Excluindo..." : "Excluir"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Alocação</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta alocação? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(allocation.id)}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
