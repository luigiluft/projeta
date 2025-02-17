
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { AllocationChart } from "@/components/Dashboard/AllocationChart";

export const ChartSection = () => {
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
    </div>
  );
};
