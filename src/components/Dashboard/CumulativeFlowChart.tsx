import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

const data = [
  { date: "01/03", todo: 40, inProgress: 30, done: 30 },
  { date: "02/03", todo: 35, inProgress: 35, done: 35 },
  { date: "03/03", todo: 30, inProgress: 40, done: 40 },
  { date: "04/03", todo: 25, inProgress: 35, done: 45 },
  { date: "05/03", todo: 20, inProgress: 30, done: 55 },
  { date: "06/03", todo: 15, inProgress: 25, done: 65 },
  { date: "07/03", todo: 10, inProgress: 20, done: 75 },
];

export function CumulativeFlowChart() {
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ChartContainer
        className="h-full w-full max-w-[800px]"
        config={{
          todo: {
            theme: {
              light: "#EF4444",
              dark: "#EF4444",
            },
          },
          inProgress: {
            theme: {
              light: "#F59E0B",
              dark: "#F59E0B",
            },
          },
          done: {
            theme: {
              light: "#22C55E",
              dark: "#22C55E",
            },
          },
        }}
      >
        <AreaChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="todo"
            name="To Do"
            stackId="1"
            stroke="#EF4444"
            fill="#FEE2E2"
          />
          <Area
            type="monotone"
            dataKey="inProgress"
            name="In Progress"
            stackId="1"
            stroke="#F59E0B"
            fill="#FEF3C7"
          />
          <Area
            type="monotone"
            dataKey="done"
            name="Done"
            stackId="1"
            stroke="#22C55E"
            fill="#DCFCE7"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}