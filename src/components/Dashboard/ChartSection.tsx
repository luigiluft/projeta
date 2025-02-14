
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { AllocationChart } from "@/components/Dashboard/AllocationChart";

export const ChartSection = () => {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Distribuição de Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsPieChart />
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Alocação da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Tendência de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <BurndownChart />
        </CardContent>
      </Card>
    </>
  );
};
