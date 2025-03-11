
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AllocationForm } from "./AllocationForm";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { Allocation } from "@/hooks/resourceAllocation/types";
import { Badge } from "@/components/ui/badge";

export interface AllocationListProps {
  projectId: string;
  onAllocationDeleted?: () => void;
}

export function AllocationList({ projectId, onAllocationDeleted }: AllocationListProps) {
  const { 
    projectAllocations, 
    teamMembers, 
    projectTasks, 
    deleteAllocation 
  } = useResourceAllocation(projectId);

  const allocations = projectAllocations.data || [];
  const members = teamMembers.data || [];
  const tasks = projectTasks.data || [];

  const isLoading = 
    projectAllocations.isLoading || 
    teamMembers.isLoading || 
    projectTasks.isLoading;

  const handleDelete = async (allocationId: string) => {
    await deleteAllocation.mutateAsync(allocationId);
    if (onAllocationDeleted) {
      onAllocationDeleted();
    }
  };

  const getAllocationStatusClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return 'Membro não encontrado';
    return `${member.first_name} ${member.last_name}`;
  };

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return 'Tarefa não encontrada';
    return task.task_name;
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Membro</TableHead>
            <TableHead>Tarefa</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Horas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : allocations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                Nenhuma alocação encontrada para este projeto.
              </TableCell>
            </TableRow>
          ) : (
            allocations.map((allocation) => (
              <TableRow key={allocation.id}>
                <TableCell>{getMemberName(allocation.member_id)}</TableCell>
                <TableCell>{getTaskName(allocation.task_id)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {allocation.start_date
                        ? format(parseISO(allocation.start_date), "dd/MM/yyyy", { locale: ptBR })
                        : "-"} até {allocation.end_date
                        ? format(parseISO(allocation.end_date), "dd/MM/yyyy", { locale: ptBR })
                        : "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{allocation.allocated_hours}h</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getAllocationStatusClass(allocation.status)}
                  >
                    {allocation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(allocation.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button>Adicionar Alocação</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Alocação</DialogTitle>
          </DialogHeader>
          <AllocationForm 
            projectId={projectId} 
            onSuccess={onAllocationDeleted}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
