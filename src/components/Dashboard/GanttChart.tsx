import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface Task {
  id: string;
  title: string;
  dueTime: string;
  completed: boolean;
}

interface GanttChartProps {
  tasks: Task[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  const data = tasks.map((task) => {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours - 1, minutes, 0);
    
    const endTime = new Date();
    endTime.setHours(hours, minutes, 0);

    return {
      name: task.title,
      start: startTime.getHours(),
      duration: 1,
      completed: task.completed,
      fill: task.completed ? "#22c55e" : "#3b82f6"
    };
  });

  return (
    <div className="w-full h-[300px]">
      <ChartContainer 
        className="h-full"
        config={{
          bar: {
            theme: {
              light: "var(--primary)",
              dark: "var(--primary)",
            },
          },
        }}
      >
        <BarChart
          data={data}
          layout="vertical"
          barGap={0}
          barCategoryGap={10}
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <XAxis type="number" domain={[8, 18]} tickCount={11} />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip />
          <Bar
            dataKey="duration"
            stackId="a"
            fill="#3b82f6"
            background={{ fill: "#f3f4f6" }}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}