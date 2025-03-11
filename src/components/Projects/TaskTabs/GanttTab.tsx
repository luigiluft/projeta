
import { Task } from "@/types/project";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useGanttData } from "./Gantt/useGanttData";
import { TaskGanttChart } from "./Gantt/TaskGanttChart";
import { AllocationGanttChart } from "./Gantt/AllocationGanttChart";

interface GanttTabProps {
  tasks: Task[];
}

export function GanttTab({ tasks }: GanttTabProps) {
  const [activeTab, setActiveTab] = useState<string>("tasks");
  const { allocations, loadingAllocations, minDate, maxDate, xAxisTicks } = useGanttData(tasks);

  // Extract project ID from the first task if available
  const projectId = tasks.length > 0 && tasks[0].project_task_id 
    ? tasks[0].project_task_id.split('_')[0] // Assuming format is "projectId_taskId"
    : "";
  
  // Use a default project name since the Task type doesn't have project_name
  const projectName = "Projeto";

  return (
    <div className="space-y-4 mt-4">
      <Tabs 
        defaultValue="tasks" 
        className="w-full" 
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 w-64 mb-4">
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="allocations">Alocações</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <h3 className="text-lg font-medium mb-4">Cronograma de Tarefas</h3>
          <TaskGanttChart 
            tasks={tasks} 
            minDate={minDate} 
            maxDate={maxDate} 
            xAxisTicks={xAxisTicks}
          />
        </TabsContent>

        <TabsContent value="allocations">
          <h3 className="text-lg font-medium mb-4">Alocações de Equipe</h3>
          <AllocationGanttChart 
            projectId={projectId}
            projectName={projectName}
            allocations={allocations}
            isLoading={loadingAllocations}
            minDate={minDate}
            maxDate={maxDate}
            xAxisTicks={xAxisTicks}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
