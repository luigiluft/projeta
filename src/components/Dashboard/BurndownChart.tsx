import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

const data = [
  { date: "01/03", remaining: 100 },
  { date: "02/03", remaining: 85 },
  { date: "03/03", remaining: 70 },
  { date: "04/03", remaining: 55 },
  { date: "05/03", remaining: 35 },
  { date: "06/03", remaining: 20 },
  { date: "07/03", remaining: 0 },
];

export function BurndownChart() {
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ChartContainer
        className="h-full w-full max-w-[800px]"
        config={{
          line: {
            theme: {
              light: "var(--primary)",
              dark: "var(--primary)",
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
            dataKey="remaining"
            strokeWidth={2}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}