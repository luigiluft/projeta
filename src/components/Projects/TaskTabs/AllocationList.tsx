
import { useEffect } from "react";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";

export interface AllocationListProps {
  projectId: string;
  onAllocationDeleted: () => void;
}

export function AllocationList({ projectId, onAllocationDeleted }: AllocationListProps) {
  const { projectAllocations, deleteAllocation } = useResourceAllocation(projectId);
  
  const allocations = projectAllocations.data || [];
  
  const handleDelete = (id: string) => {
    deleteAllocation(id, {
      onSuccess: () => {
        onAllocationDeleted();
      }
    });
  };
  
  return (
    <div className="space-y-4">
      {allocations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma alocação encontrada para este projeto.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-2">Membro</th>
                <th className="text-left p-2">Tarefa</th>
                <th className="text-center p-2">Data Início</th>
                <th className="text-center p-2">Data Fim</th>
                <th className="text-center p-2">Horas</th>
                <th className="text-center p-2">Status</th>
                <th className="text-center p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation) => (
                <tr key={allocation.id} className="border-b">
                  <td className="p-2">{allocation.member_first_name} {allocation.member_last_name}</td>
                  <td className="p-2">{allocation.task_name || "Sem tarefa"}</td>
                  <td className="p-2 text-center">{allocation.start_date}</td>
                  <td className="p-2 text-center">{allocation.end_date}</td>
                  <td className="p-2 text-center">{allocation.allocated_hours}h</td>
                  <td className="p-2 text-center">{allocation.status}</td>
                  <td className="p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => allocation.id && handleDelete(allocation.id)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
