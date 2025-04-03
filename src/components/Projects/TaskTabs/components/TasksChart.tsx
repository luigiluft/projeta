
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskTooltip } from "./GanttTooltips";

interface TasksChartProps {
  taskChartData: any[];
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
  if (taskChartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md border">
        <p className="text-gray-500">Nenhuma tarefa de implementação encontrada.</p>
      </div>
    );
  }

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
            
            {/* Barra representando a duração entre início e fim da tarefa */}
            <Bar
              dataKey="value"
              name="Duração"
              minPointSize={3}
              barSize={20}
              fill={isNewProject ? "#f59e0b" : "#60a5fa"} // Cor diferente para projetos novos
              radius={[4, 4, 4, 4]}
              background={{ fill: "#eee" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ScrollArea>
  );
};
