
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
import { Skeleton } from "@/components/ui/skeleton";
import { AllocationTooltip } from "./GanttTooltips";

interface AllocationsChartProps {
  allocationChartData: any[];
  allocationChartHeight: number;
  xAxisTicks: number[];
  minDate: Date;
  maxDate: Date;
  loadingAllocations: boolean;
  isNewProject: boolean;
}

export const AllocationsChart: React.FC<AllocationsChartProps> = ({
  allocationChartData,
  allocationChartHeight,
  xAxisTicks,
  minDate,
  maxDate,
  loadingAllocations,
  isNewProject
}) => {
  if (loadingAllocations) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (allocationChartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md border">
        <p className="text-gray-500">
          {isNewProject 
            ? "Sem alocações existentes para exibir como referência." 
            : "Não há alocações de recursos para este projeto."}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="border rounded-md p-4 bg-white shadow-sm h-[500px]">
      <div style={{ height: `${allocationChartHeight}px`, minWidth: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={allocationChartData}
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
            <Tooltip content={(props) => <AllocationTooltip active={props.active} payload={props.payload} />} />
            <Legend />
            
            {/* Barra representando a duração entre início e fim da alocação */}
            <Bar
              dataKey="value"
              name="Alocação"
              minPointSize={3}
              barSize={20}
              fill="#10b981"
              radius={[4, 4, 4, 4]}
              background={{ fill: "#eee" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ScrollArea>
  );
};
