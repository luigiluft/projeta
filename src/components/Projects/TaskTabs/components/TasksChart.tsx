
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskTooltip } from "./GanttTooltip";
import { format } from "date-fns";

interface TaskChartItem {
  id: string;
  name: string;
  owner?: string;
  startTime: number;
  endTime: number;
  value: [number, number];
  displayStartDate: string;
  displayEndDate: string;
  displayDuration: string;
  durationDays: number;
  isEstimated?: boolean;
}

interface TasksChartProps {
  taskChartData: TaskChartItem[];
  taskChartHeight: number;
  xAxisTicks: number[];
  minDate: Date;
  maxDate: Date;
  isNewProject: boolean;
}

export const TasksChart: React.FC<TasksChartProps> = ({
  taskChartData,
  taskChartHeight,
  xAxisTicks,
  minDate,
  maxDate,
  isNewProject
}) => {
  const today = new Date().getTime();

  if (taskChartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md border">
        <p className="text-gray-500">Nenhuma tarefa com datas definidas encontrada.</p>
      </div>
    );
  }

  // Verificar se temos dados válidos
  const hasValidData = taskChartData.some(task => 
    !isNaN(task.startTime) && !isNaN(task.endTime)
  );

  if (!hasValidData) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md border">
        <p className="text-gray-500">Dados do gráfico inválidos. Verifique as datas das tarefas.</p>
      </div>
    );
  }

  console.log("Renderizando gráfico com", taskChartData.length, "tarefas");
  console.log("Primeira tarefa:", taskChartData[0]);

  return (
    <ScrollArea className="border rounded-md p-4 bg-white shadow-sm h-[500px]">
      <div style={{ height: `${taskChartHeight}px`, minWidth: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={taskChartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
            barGap={0}
            barCategoryGap={5}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis 
              type="number"
              domain={[minDate.getTime(), maxDate.getTime()]}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
              scale="time"
              ticks={xAxisTicks}
              allowDataOverflow={true}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={(props) => <TaskTooltip active={props.active} payload={props.payload} />} />
            <Legend />
            
            {/* Linha vertical representando o dia atual */}
            <ReferenceLine x={today} stroke="#f43f5e" strokeWidth={2} label={{ value: 'Hoje', position: 'top', fill: '#f43f5e' }} />
            
            {/* Barra representando a duração entre início e fim da tarefa */}
            <Bar
              dataKey="value"
              name="Duração"
              minPointSize={3}
              barSize={20}
              fill={isNewProject ? "#f59e0b" : "#60a5fa"} // Cor diferente para projetos novos
              radius={[4, 4, 4, 4]}
              background={{ fill: "#eee" }}
              label={{
                position: 'right',
                formatter: (item: any) => item.displayDuration,
                fill: '#6b7280',
                fontSize: 10
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ScrollArea>
  );
};
