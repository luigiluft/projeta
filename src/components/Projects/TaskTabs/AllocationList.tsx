
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useResourceAllocation } from "@/hooks/useResourceAllocation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AllocationListProps {
  projectId?: string;
  onAllocationDeleted?: () => void;
}

export function AllocationList({ projectId, onAllocationDeleted }: AllocationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { projectAllocations, deleteAllocation, allocationsLoading } = useResourceAllocation(projectId);

  const handleDelete = async (id: string) => {
    try {
      await deleteAllocation(id);
      toast.success("Alocação removida com sucesso");
      if (onAllocationDeleted) onAllocationDeleted();
    } catch (error) {
      console.error("Erro ao remover alocação:", error);
      toast.error("Erro ao remover alocação");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Agendada</Badge>;
      case "in_progress":
        return <Badge variant="secondary">Em Andamento</Badge>;
      case "completed":
        return <Badge variant="default">Concluída</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (allocationsLoading) {
    return <div>Carregando alocações...</div>;
  }

  if (!projectAllocations || projectAllocations.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma alocação encontrada para este projeto</div>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-1">
        {projectAllocations.map((allocation) => (
          <Card key={allocation.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-semibold">
                    {allocation.member_first_name} {allocation.member_last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{allocation.member_position}</p>
                  
                  <div className="flex gap-2">
                    {getStatusBadge(allocation.status)}
                    <Badge variant="outline">{allocation.allocated_hours}h</Badge>
                  </div>
                  
                  <p className="text-sm">
                    {format(new Date(allocation.start_date), "dd/MM/yyyy", { locale: ptBR })} até{" "}
                    {format(new Date(allocation.end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  
                  {allocation.task_name && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Tarefa:</span> {allocation.task_name}
                    </p>
                  )}
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover alocação</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover esta alocação? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(allocation.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
