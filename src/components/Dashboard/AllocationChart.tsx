import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const data = [
  { name: "João Silva", allocated: 30, available: 10 },
  { name: "Maria Santos", allocated: 25, available: 15 },
  { name: "Pedro Costa", allocated: 35, available: 5 },
  { name: "Ana Oliveira", allocated: 20, available: 20 },
  { name: "Lucas Souza", allocated: 40, available: 0 },
];

export function AllocationChart() {
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ChartContainer
        className="h-full w-full max-w-[800px]"
        config={{
          allocated: {
            theme: {
              light: "#8B5CF6",
              dark: "#8B5CF6",
            },
          },
          available: {
            theme: {
              light: "#D6BCFA",
              dark: "#D6BCFA",
            },
          },
        }}
      >
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="allocated"
            name="Horas Alocadas"
            stackId="a"
            fill="#8B5CF6"
          />
          <Bar
            dataKey="available"
            name="Horas Disponíveis"
            stackId="a"
            fill="#D6BCFA"
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}