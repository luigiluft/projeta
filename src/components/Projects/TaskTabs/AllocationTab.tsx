
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { AllocationForm } from "./AllocationForm";
import { AllocationList } from "./AllocationList";
import { AutoAllocation } from "./AutoAllocation";
import { useProjectAllocations } from "@/hooks/resourceAllocation/useProjectAllocations";
import { useProjectTasks } from "@/hooks/resourceAllocation/useProjectTasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AllocationGanttChart } from "./Gantt/AllocationGanttChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AllocationTabProps {
  projectId: string;
  projectName: string;
}

export function AllocationTab({ projectId, projectName }: AllocationTabProps) {
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [showAutoAllocForm, setShowAutoAllocForm] = useState(false);
  const { refetch } = useProjectAllocations(projectId);
  const { data: projectTasks = [] } = useProjectTasks(projectId);
  const [activeTab, setActiveTab] = useState("list");
  
  const handleRefetch = () => {
    refetch();
  };
  
  const handleAllocationDeleted = () => {
    refetch();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Alocações do Projeto</h2>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefetch}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
          
          <Dialog open={showAutoAllocForm} onOpenChange={setShowAutoAllocForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Alocação Automática
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Alocação Automática de Recursos</DialogTitle>
              </DialogHeader>
              <AutoAllocation 
                projectId={projectId}
                tasks={projectTasks}
                onSuccess={() => {
                  setShowAutoAllocForm(false);
                  handleRefetch();
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAllocationForm} onOpenChange={setShowAllocationForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nova Alocação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Nova Alocação</DialogTitle>
              </DialogHeader>
              <AllocationForm 
                projectId={projectId}
                onSuccess={() => {
                  setShowAllocationForm(false);
                  handleRefetch();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          <AllocationList 
            projectId={projectId} 
            onAllocationDeleted={handleAllocationDeleted} 
          />
        </TabsContent>
        
        <TabsContent value="gantt" className="mt-0">
          <AllocationGanttChart 
            projectId={projectId} 
            projectName={projectName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
