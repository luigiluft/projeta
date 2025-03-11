
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AllocationTooltip } from "./AllocationTooltip";

interface TeamAllocation {
  id: string;
  member_id: string;
  member_name: string;
  project_id: string;
  task_id: string;
  task_name: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: string;
}

interface AllocationGanttChartProps {
  allocations: TeamAllocation[];
  isLoading: boolean;
  minDate: Date;
  maxDate: Date;
  xAxisTicks: number[];
}

export function AllocationGanttChart({ 
  allocations, 
  isLoading, 
  minDate, 
  maxDate, 
  xAxisTicks 
}: AllocationGanttChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md border">
        <p className="text-gray-500">
          Não há alocações de recursos para este projeto.
        </p>
      </div>
    );
  }

  // Prepare data for the chart
  const allocationChartData = allocations.map(allocation => {
    const startDate = new Date(allocation.start_date);
    const endDate = new Date(allocation.end_date);
    
    return {
      name: allocation.task_name,
      member: allocation.member_name,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      value: [startDate.getTime(), endDate.getTime()],
      displayStartDate: format(startDate, "dd/MM/yyyy", { locale: ptBR }),
      displayEndDate: format(endDate, "dd/MM/yyyy", { locale: ptBR }),
      displayDuration: allocation.allocated_hours,
      status: allocation.status
    };
  });

  // Calculate height based on number of allocations
  const allocationChartHeight = Math.max(500, allocationChartData.length * 40);

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
              tickFormatter={(timestamp) => format(new Date(timestamp), "dd/MM", { locale: ptBR })}
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
            <Tooltip content={<AllocationTooltip />} />
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
}
