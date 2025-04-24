
import { useState, useEffect } from "react";
import { Task, Column } from "@/types/project";
import { EmptyTasks } from "./EmptyTasks";
import { GanttPreviewAlert } from "./components/GanttPreviewAlert";
import { processTasks } from "../utils/taskCalculations";
import { calculateGanttData } from "./utils/ganttCalculations";
import { GanttTooltip } from "./components/GanttTooltip";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatDate } from "@/utils/format";
import { TasksChart } from "./components/TasksChart";
import { AllocationsChart } from "./components/AllocationsChart";

interface GanttTabProps {
  tasks: Task[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  attributeValues: Record<string, number>;
}

export function GanttTab({ tasks, attributeValues, columns, onColumnsChange }: GanttTabProps) {
  const [calculatedTasks, setCalculatedTasks] = useState<Task[]>([]);
  const [ganttData, setGanttData] = useState<any[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskChartData, setTaskChartData] = useState<any[]>([]);
  const [allocationChartData, setAllocationChartData] = useState<any[]>([]);
  const [taskChartHeight, setTaskChartHeight] = useState(400);
  const [allocationChartHeight, setAllocationChartHeight] = useState(300);
  const [xAxisTicks, setXAxisTicks] = useState<number[]>([]);
  const [minDate, setMinDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>(new Date());
  const [isNewProject, setIsNewProject] = useState(false);
  const [loadingAllocations, setLoadingAllocations] = useState(false);

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      console.log("GanttTab: Nenhuma tarefa para processar");
      return;
    }

    console.log(`GanttTab: Processando ${tasks.length} tarefas com atributos:`, attributeValues);
    
    // Processar tarefas com os atributos numéricos
    const processedTasks = processTasks(tasks, attributeValues);
    setCalculatedTasks(processedTasks);
    
    // Calcular dados para o gráfico de Gantt
    const ganttInfo = calculateGanttData(processedTasks);
    setGanttData(ganttInfo);
    
    console.log("GanttTab: Dados calculados para o Gantt:", ganttInfo.length);
    
    // Preparar dados para o gráfico de tarefas
    // Neste exemplo, usamos os mesmos dados do gantt, mas em um projeto real
    // você poderia processar dados específicos para cada visualização
    setTaskChartData(ganttInfo);
    setTaskChartHeight(30 * Math.max(5, ganttInfo.length)); // altura dinâmica baseada no número de tarefas
    
    // Normalmente você buscaria dados de alocação do backend
    setAllocationChartData([]);
    setAllocationChartHeight(200);
    
    // Definir datas mínimas e máximas para os gráficos
    if (ganttInfo.length > 0) {
      let earliestDate = new Date();
      let latestDate = new Date();
      
      ganttInfo.forEach(item => {
        const startDate = new Date(item.start);
        const endDate = new Date(item.end);
        
        if (startDate < earliestDate) earliestDate = startDate;
        if (endDate > latestDate) latestDate = endDate;
      });
      
      setMinDate(earliestDate);
      setMaxDate(latestDate);
      
      // Criar ticks para o eixo X
      const ticks: number[] = [];
      const currentDate = new Date(earliestDate);
      while (currentDate <= latestDate) {
        ticks.push(new Date(currentDate).getTime());
        currentDate.setDate(currentDate.getDate() + 7); // Ticks a cada 7 dias
      }
      setXAxisTicks(ticks);
    }
    
    // Verificar se é um novo projeto (sem datas definidas nas tarefas)
    const isNew = tasks.some(task => !task.start_date || !task.end_date);
    setIsNewProject(isNew);
    
  }, [tasks, attributeValues]);

  // Resto do componente...

  return (
    <div className="space-y-6">
      {calculatedTasks.length > 0 ? (
        <>
          <GanttPreviewAlert isNewProject={isNewProject} show={isNewProject} />
          
          {/* Gráficos de tarefas e alocações */}
          <div className="space-y-6">
            <TasksChart 
              taskChartData={taskChartData} 
              taskChartHeight={taskChartHeight}
              xAxisTicks={xAxisTicks}
              minDate={minDate}
              maxDate={maxDate}
              isNewProject={isNewProject}
            />
            <AllocationsChart 
              allocationChartData={allocationChartData}
              allocationChartHeight={allocationChartHeight}
              xAxisTicks={xAxisTicks}
              minDate={minDate}
              maxDate={maxDate}
              loadingAllocations={loadingAllocations}
              isNewProject={isNewProject}
            />
          </div>
          
          {/* Visualização do Gantt */}
          {ganttData.length > 0 ? (
            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-sm font-medium mb-4">Cronograma de Tarefas (Preview)</h3>
              <ResponsiveContainer width="100%" height={400}>
                {/* Gráfico de barras horizontais para simulação de Gantt */}
                <BarChart
                  layout="vertical"
                  data={ganttData}
                  barSize={20}
                  margin={{ top: 20, right: 30, left: 150, bottom: 10 }}
                >
                  <XAxis 
                    type="number"
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => formatDate(new Date(value))}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={130} 
                  />
                  <Tooltip content={<GanttTooltip />} />
                  <Bar dataKey="duration" fill="#8884d8" background={{ fill: '#eee' }}>
                    {ganttData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={
                          entry.progress === 100 ? '#10b981' : 
                          entry.progress >= 50 ? '#3b82f6' : 
                          entry.status === 'in_progress' ? '#eab308' : 
                          '#94a3b8'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="border rounded-md p-6 bg-gray-50 text-center">
              <p className="text-muted-foreground">Não foi possível gerar o gráfico de Gantt com as tarefas selecionadas</p>
            </div>
          )}
        </>
      ) : (
        <EmptyTasks message="Selecione pelo menos uma tarefa para visualizar o cronograma Gantt" />
      )}
    </div>
  );
}
