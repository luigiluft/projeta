
import { Task } from "@/types/project";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAllocationData } from "@/hooks/useAllocationData";
import { 
  calculateEstimatedDates,
  filterImplementationTasks,
  findMinMaxDates,
  prepareTaskChartData,
  prepareAllocationChartData,
  createDateRange,
  formatXAxisTicks
} from "./utils/ganttCalculations";
import { TasksChart } from "./components/TasksChart";
import { AllocationsChart } from "./components/AllocationsChart";
import { GanttPreviewAlert } from "./components/GanttPreviewAlert";

interface GanttTabProps {
  tasks: Task[];
}

export function GanttTab({ tasks }: GanttTabProps) {
  const [activeTab, setActiveTab] = useState<string>("tasks");
  const location = useLocation();
  
  // Verificar se estamos na página de novo projeto
  const isNewProject = location.pathname === "/projects/new";

  // Obter o project_id do primeiro task, se disponível
  const taskProjectId = tasks.length > 0 && tasks[0].project_task_id
    ? tasks[0].project_task_id
    : undefined;

  // Usar o hook para carregar alocações
  const { allocations, loadingAllocations } = useAllocationData(isNewProject, tasks[0]?.project_task_id);

  // Filtrar tarefas que são apenas de implementação
  const implementationTasks = filterImplementationTasks(tasks);

  // Preparar tarefas para o gráfico, considerando se é um novo projeto ou não
  let tasksForChart = implementationTasks;
  
  // Para novos projetos, calcular datas estimadas
  if (isNewProject && implementationTasks.length > 0) {
    tasksForChart = calculateEstimatedDates(implementationTasks, allocations);
  }

  // Organizar tarefas por data de início
  const sortedTasks = [...tasksForChart].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
    return dateA - dateB;
  });

  // Encontrar data mais antiga e mais recente para definir o domínio do gráfico
  const { minDate, maxDate } = findMinMaxDates(sortedTasks, allocations);

  // Preparar dados para o gráfico de tarefas
  const taskChartData = prepareTaskChartData(sortedTasks);

  // Preparar dados para o gráfico de alocações
  const allocationChartData = prepareAllocationChartData(allocations);

  // Criar um array com todas as datas entre o início do projeto e o final
  const dateRange = createDateRange(minDate, maxDate);

  // Formatar o conjunto de dados para o eixo X
  const xAxisTicks = formatXAxisTicks(dateRange);

  // Calcular a altura necessária baseada no número de tarefas ou alocações
  const taskChartHeight = Math.max(500, taskChartData.length * 40);
  const allocationChartHeight = Math.max(500, allocationChartData.length * 40);

  return (
    <div className="space-y-4 mt-4">
      <GanttPreviewAlert isNewProject={isNewProject} />
      
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
          
          <TasksChart 
            taskChartData={taskChartData}
            taskChartHeight={taskChartHeight}
            xAxisTicks={xAxisTicks}
            minDate={minDate}
            maxDate={maxDate}
            isNewProject={isNewProject}
          />
        </TabsContent>

        <TabsContent value="allocations">
          <h3 className="text-lg font-medium mb-4">Alocações de Equipe</h3>
          
          <AllocationsChart 
            allocationChartData={allocationChartData}
            allocationChartHeight={allocationChartHeight}
            xAxisTicks={xAxisTicks}
            minDate={minDate}
            maxDate={maxDate}
            loadingAllocations={loadingAllocations}
            isNewProject={isNewProject}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
