
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationForm } from "./AllocationForm";
import { AutoAllocation } from "./AutoAllocation";
import { AllocationList } from "./AllocationList";
import { AllocationGanttChart } from "./Gantt/AllocationGanttChart";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { GetAllocationListProps } from "@/hooks/resourceAllocation/types";

interface AllocationTabProps {
  projectId: string;
  projectName: string;
}

export function AllocationTab({ projectId, projectName }: AllocationTabProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  const { projectTasks, projectAllocations } = useResourceAllocation(projectId);
  
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["project-allocations", projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["project-tasks", projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["team-members"],
        }),
      ]);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleAllocationSuccess = () => {
    // Atualiza os dados após uma alocação bem-sucedida
    handleRefresh();
  };

  const handleAllocationDeleted = () => {
    // Atualiza os dados após uma alocação ser excluída
    handleRefresh();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alocação de Recursos</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>
      
      <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="manual">Alocação Manual</TabsTrigger>
          <TabsTrigger value="auto">Auto-Alocação</TabsTrigger>
          <TabsTrigger value="gantt">Visualização Gantt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-6">
          <AllocationForm 
            projectId={projectId}
            onSuccess={handleAllocationSuccess}
          />
          
          <AllocationList 
            projectId={projectId}
            onAllocationDeleted={handleAllocationDeleted}
          />
        </TabsContent>
        
        <TabsContent value="auto" className="space-y-6">
          <AutoAllocation 
            projectId={projectId}
            onSuccess={handleAllocationSuccess}
            tasks={projectTasks.data || []}
          />
        </TabsContent>
        
        <TabsContent value="gantt" className="space-y-6">
          <AllocationGanttChart
            projectId={projectId}
            projectName={projectName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
