
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { AllocationChart } from "@/components/Dashboard/AllocationChart";
import { CumulativeFlowChart } from "@/components/Dashboard/CumulativeFlowChart";

interface ChartSectionProps {
  projectStats: Array<{
    status: string;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    pending_tasks: number;
  }>;
}

export const ChartSection = ({ projectStats }: ChartSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Distribuição de Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsPieChart />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Alocação da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Tendência de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BurndownChart />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Fluxo de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CumulativeFlowChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
