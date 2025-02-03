import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";

const data = [
  { name: "Website Redesign", value: 75 },
  { name: "Mobile App", value: 45 },
  { name: "Marketing Campaign", value: 90 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export function ProjectsPieChart() {
  return (
    <div className="w-full h-[300px]">
      <ChartContainer
        className="h-full"
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
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}