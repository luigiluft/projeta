import { useState, useEffect } from "react";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";

export interface AllocationGanttChartProps {
  projectId: string;
  projectName: string;
}

export function AllocationGanttChart({ projectId, projectName }: AllocationGanttChartProps) {
  const { projectAllocations } = useResourceAllocation(projectId);
  const allocations = projectAllocations.data || [];
  
  // Implementation of gantt chart would be here
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Gantt de Alocações: {projectName}</h3>
      
      {allocations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma alocação encontrada para visualizar no gantt.
        </div>
      ) : (
        <div className="h-80 border rounded-md p-4">
          {/* Gantt visualization will go here */}
          <div className="text-center py-8 text-muted-foreground">
            Visualização de gantt em desenvolvimento.
          </div>
        </div>
      )}
    </div>
  );
}
