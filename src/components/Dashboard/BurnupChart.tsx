import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

const data = [
  { date: "01/03", completed: 0, total: 100 },
  { date: "02/03", completed: 15, total: 100 },
  { date: "03/03", completed: 30, total: 100 },
  { date: "04/03", completed: 45, total: 100 },
  { date: "05/03", completed: 65, total: 100 },
  { date: "06/03", completed: 80, total: 100 },
  { date: "07/03", completed: 100, total: 100 },
];

export function BurnupChart() {
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ChartContainer
        className="h-full w-full max-w-[800px]"
        config={{
          completed: {
            theme: {
              light: "#22C55E",
              dark: "#22C55E",
            },
          },
          total: {
            theme: {
              light: "#94A3B8",
              dark: "#94A3B8",
            },
          },
        }}
      >
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="completed"
            name="Completed"
            strokeWidth={2}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            strokeWidth={2}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}