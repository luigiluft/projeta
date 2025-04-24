
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
    
  }, [tasks, attributeValues]);

  // Resto do componente...

  return (
    <div className="space-y-6">
      {calculatedTasks.length > 0 ? (
        <>
          <GanttPreviewAlert />
          
          {/* Gráficos de tarefas e alocações */}
          <div className="space-y-6">
            <TasksChart tasks={calculatedTasks} />
            <AllocationsChart tasks={calculatedTasks} />
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
