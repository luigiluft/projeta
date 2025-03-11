
import { useState, useEffect } from "react";
import { useResourceAllocation } from "@/hooks/resourceAllocation/useResourceAllocation";
import { Allocation, ProjectAllocation } from "@/hooks/resourceAllocation/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export interface AllocationGanttChartProps {
  projectId: string;
  projectName: string;
  // Support both direct allocations passed in or fetching via hook
  allocations?: TeamAllocation[];
  isLoading?: boolean;
  minDate?: Date;
  maxDate?: Date;
  xAxisTicks?: number[];
}

export function AllocationGanttChart({ 
  projectId, 
  projectName,
  allocations: externalAllocations,
  isLoading: externalLoading,
  minDate: externalMinDate,
  maxDate: externalMaxDate,
  xAxisTicks: externalTicks
}: AllocationGanttChartProps) {
  const { projectAllocations } = useResourceAllocation(projectId);
  const internalAllocations = projectAllocations.data || [];
  
  // Use external data if provided, otherwise use data from hook
  const allocations = externalAllocations || internalAllocations;
  const isLoading = externalLoading !== undefined ? externalLoading : projectAllocations.isLoading;
  
  // Chart configuration
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Calculate min and max dates if not provided externally
  const [minDate, setMinDate] = useState<Date>(externalMinDate || new Date());
  const [maxDate, setMaxDate] = useState<Date>(externalMaxDate || new Date());
  const xAxisTicks = externalTicks || [];

  // Process allocations for chart display
  useEffect(() => {
    if (allocations.length === 0) return;
    
    // Transform allocations for chart display
    const data = allocations.map((allocation: any) => {
      const startDate = new Date(allocation.start_date);
      const endDate = new Date(allocation.end_date);
      
      return {
        name: allocation.member_name || 
          `${allocation.member_first_name || ''} ${allocation.member_last_name || ''}`.trim(),
        task: allocation.task_name || "Sem tarefa",
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        value: [startDate.getTime(), endDate.getTime()],
        displayStartDate: format(startDate, "dd/MM/yyyy", { locale: ptBR }),
        displayEndDate: format(endDate, "dd/MM/yyyy", { locale: ptBR }),
        displayHours: allocation.allocated_hours,
      };
    });
    
    setChartData(data);
    
    // Calculate min and max dates if not provided externally
    if (!externalMinDate || !externalMaxDate) {
      let min = new Date();
      let max = new Date();
      
      if (data.length > 0) {
        min = new Date(Math.min(...data.map(d => d.startTime)));
        max = new Date(Math.max(...data.map(d => d.endTime)));
      }
      
      setMinDate(min);
      setMaxDate(max);
    }
  }, [allocations, externalMinDate, externalMaxDate]);
  
  // Calculate height based on number of team members
  const chartHeight = Math.max(400, chartData.length * 40);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Gantt de Alocações: {projectName}</h3>
        <div className="h-80 border rounded-md p-4 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando alocações...</p>
        </div>
      </div>
    );
  }
  
  if (allocations.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Gantt de Alocações: {projectName}</h3>
        
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma alocação encontrada para visualizar no gantt.
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Gantt de Alocações: {projectName}</h3>
      
      <ScrollArea className="border rounded-md p-4 bg-white shadow-sm h-[500px]">
        <div style={{ height: `${chartHeight}px`, minWidth: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                ticks={xAxisTicks.length > 0 ? xAxisTicks : undefined}
                allowDataOverflow={true}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (Array.isArray(value)) {
                    return [`${chartData.find(d => d.value[0] === value[0])?.displayHours}h`, "Horas alocadas"];
                  }
                  return [value, name];
                }}
                labelFormatter={(value) => {
                  const data = chartData.find(d => d.value[0] === value[0] || d.value[1] === value[1]);
                  if (data) {
                    return `${data.name} - ${data.task}\n${data.displayStartDate} até ${data.displayEndDate}`;
                  }
                  return "";
                }}
              />
              
              <Bar
                dataKey="value"
                name="Período"
                minPointSize={3}
                barSize={20}
                fill="#60a5fa"
                radius={[4, 4, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ScrollArea>
    </div>
  );
}
