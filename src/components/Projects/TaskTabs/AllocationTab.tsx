
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationList } from "./AllocationList";
import { AutoAllocation } from "./AutoAllocation";
import { AllocationGanttChart } from "./Gantt/AllocationGanttChart";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { Task } from "@/types/project";

interface AllocationTabProps {
  projectId: string;
  projectName: string;
  tasks: Task[];
}

export function AllocationTab({ projectId, projectName, tasks }: AllocationTabProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-4" key={refreshKey}>
      <h2 className="text-xl font-semibold">Gestão de Alocações</h2>
      
      <Tabs defaultValue="list" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="list">Lista de Alocações</TabsTrigger>
          <TabsTrigger value="auto">Alocação Automática</TabsTrigger>
          <TabsTrigger value="gantt">Visualização Gantt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <AllocationList 
            projectId={projectId} 
            onAllocationDeleted={handleRefresh}
          />
        </TabsContent>
        
        <TabsContent value="auto" className="mt-6">
          <AutoAllocation
            projectId={projectId}
            tasks={tasks}
            onSuccess={handleRefresh}
          />
        </TabsContent>
        
        <TabsContent value="gantt" className="mt-6">
          <AllocationGanttChart
            projectId={projectId}
            projectName={projectName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
