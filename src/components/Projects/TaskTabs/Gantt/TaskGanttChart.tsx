
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, addDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskTooltip } from "./TaskTooltip";
import { Task } from "@/types/project";

interface TaskGanttChartProps {
  tasks: Task[];
  minDate: Date;
  maxDate: Date;
  xAxisTicks: number[];
}

export function TaskGanttChart({ tasks, minDate, maxDate, xAxisTicks }: TaskGanttChartProps) {
  // Filter implementation tasks
  const implementationTasks = tasks.filter(task => 
    !task.epic.toLowerCase().includes('sustentação') &&
    !task.epic.toLowerCase().includes('sustentacao')
  );

  // Sort tasks by start date
  const sortedTasks = [...implementationTasks].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
    return dateA - dateB;
  });

  // Prepare data for the chart
  const taskChartData = sortedTasks.map(task => {
    // Ensure valid dates
    const startDate = task.start_date ? new Date(task.start_date) : new Date();
    const endDate = task.end_date ? new Date(task.end_date) : new Date(startDate);
    
    return {
      name: task.task_name,
      owner: task.owner,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      value: [startDate.getTime(), endDate.getTime()], // Array with start and end
      displayStartDate: format(startDate, "dd/MM/yyyy", { locale: ptBR }),
      displayEndDate: format(endDate, "dd/MM/yyyy", { locale: ptBR }),
      displayDuration: task.calculated_hours || task.fixed_hours || 0,
    };
  });

  // Calculate height based on number of tasks
  const taskChartHeight = Math.max(500, taskChartData.length * 40);

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
            <Tooltip content={<TaskTooltip />} />
            
            {/* Barra representando a duração entre início e fim da tarefa */}
            <Bar
              dataKey="value"
              name="Duração"
              minPointSize={3}
              barSize={20}
              fill="#60a5fa"
              radius={[4, 4, 4, 4]}
              background={{ fill: "#eee" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ScrollArea>
  );
}
