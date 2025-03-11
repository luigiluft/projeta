import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { ProjectAllocation } from "@/hooks/resourceAllocation/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Trash2 } from "lucide-react";
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
  projectId: string;
  taskId?: string;
  onAllocationDeleted: () => void;
}

export function AllocationList({ projectId, taskId, onAllocationDeleted }: AllocationListProps) {
  const { projectAllocations, deleteAllocation } = useResourceAllocation();
  const [allocations, setAllocations] = useState<ProjectAllocation[]>([]);
  const [allocationToDelete, setAllocationToDelete] = useState<string | null>(null);
  const [openAlert, setOpenAlert] = useState(false);

  useEffect(() => {
    // Filter allocations based on projectId and taskId
    let filteredAllocations = projectAllocations.filter(allocation => allocation.project_id === projectId);
    if (taskId) {
      filteredAllocations = filteredAllocations.filter(allocation => allocation.task_id === taskId);
    }
    setAllocations(filteredAllocations);
  }, [projectAllocations, projectId, taskId]);

  const handleDeleteClick = (allocationId: string) => {
    setAllocationToDelete(allocationId);
    setOpenAlert(true);
  };

  const confirmDelete = async () => {
    if (allocationToDelete) {
      await deleteAllocation(allocationToDelete);
      onAllocationDeleted();
      setAllocationToDelete(null);
      setOpenAlert(false);
    }
  };

  return (
    <div>
      {allocations.length === 0 ? (
        <div className="rounded-md border p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Nenhuma alocação encontrada</h4>
          </div>
          <div className="text-sm text-muted-foreground">
            Não há alocações para este projeto e tarefa.
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map(allocation => (
              <TableRow key={allocation.id}>
                <TableCell>{allocation.member_first_name} {allocation.member_last_name}</TableCell>
                <TableCell>{allocation.member_position}</TableCell>
                <TableCell>{format(new Date(allocation.start_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell>{format(new Date(allocation.end_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell>{allocation.allocated_hours}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(allocation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá deletar a alocação permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenAlert(false)}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
