
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Task } from "@/types/project";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AllocationForm } from "./AllocationForm";
import { AllocationList } from "./AllocationList";
import { AutoAllocation } from "./AutoAllocation";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";

interface AllocationTabProps {
  tasks: Task[];
  projectId?: string;
}

export function AllocationTab({ tasks, projectId }: AllocationTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const queryClient = useQueryClient();
  const { teamMembers, projectTasks, createAllocation, loading } = useResourceAllocation(projectId);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
    setRefreshKey(prev => prev + 1);
  };

  const handleSuccess = () => {
    handleRefresh();
    setIsOpen(false);
  };

  const handleSubmitAllocation = (allocation: any) => {
    createAllocation(allocation);
    handleSuccess();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Alocações de Recursos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Alocação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Alocação</DialogTitle>
                <DialogDescription>
                  Aloque membros da equipe para trabalhar neste projeto.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                {projectId && (
                  <AllocationForm 
                    projectId={projectId}
                    teamMembers={teamMembers}
                    tasks={projectTasks}
                    onSubmit={handleSubmitAllocation}
                    onCancel={handleCancel}
                    onSuccess={handleSuccess}
                    isLoading={loading}
                  />
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />
      
      <AutoAllocation 
        tasks={tasks} 
        projectId={projectId} 
        onSuccess={handleRefresh}
      />

      <Card key={refreshKey}>
        <CardContent className="p-6">
          <AllocationList 
            projectId={projectId} 
            onAllocationDeleted={handleRefresh} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
