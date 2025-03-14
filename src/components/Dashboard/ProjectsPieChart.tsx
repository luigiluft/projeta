import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";

const data = [
  { name: "Redesenho do Website", value: 75 },
  { name: "App Mobile", value: 45 },
  { name: "Campanha de Marketing", value: 90 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export function ProjectsPieChart() {
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ChartContainer
        className="h-full w-full max-w-[800px]"
        config={{
          pie: {
            theme: {
              light: "var(--primary)",
              dark: "var(--primary)",
            },
          },
        }}
      >
        <PieChart>
          <Pie
            data={data}
            cx="40%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <ChartLegend 
            verticalAlign="middle" 
            align="right"
            layout="vertical"
            content={<ChartLegendContent nameKey="name" />}
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}