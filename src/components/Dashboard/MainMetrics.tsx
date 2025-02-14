
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Target, Clock, TrendingUp } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/format";

interface MainMetricsProps {
  dashboardStats: {
    totalRevenue: number;
    profitMargin: number;
    activeProjects: number;
    totalProjects: number;
    averageAccuracy: number;
    taskCompletionRate: number;
  };
}

export const MainMetrics = ({ dashboardStats }: MainMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">
              Performance Financeira
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 space-y-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardStats.totalRevenue)}
              </span>
              <span className="text-sm text-emerald-600 flex items-center mt-1">
                Margem: {formatPercentage(dashboardStats.profitMargin)}
              </span>
            </div>
            <Progress value={dashboardStats.profitMargin} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">
              Gestão de Projetos
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 space-y-2">
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {dashboardStats.activeProjects}
                </span>
                <span className="text-sm text-gray-500">
                  de {dashboardStats.totalProjects}
                </span>
              </div>
              <span className="text-sm text-blue-600 flex items-center mt-1">
                Projetos em Andamento
              </span>
            </div>
            <Progress 
              value={(dashboardStats.activeProjects / dashboardStats.totalProjects) * 100} 
              className="h-1.5" 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">
              Precisão das Estimativas
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 space-y-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                {formatPercentage(dashboardStats.averageAccuracy)}
              </span>
              <span className="text-sm text-purple-600 flex items-center mt-1">
                Média de Assertividade
              </span>
            </div>
            <Progress value={dashboardStats.averageAccuracy} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">
              Produtividade
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 space-y-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                {formatPercentage(dashboardStats.taskCompletionRate)}
              </span>
              <span className="text-sm text-green-600 flex items-center mt-1">
                Taxa de Conclusão
              </span>
            </div>
            <Progress value={dashboardStats.taskCompletionRate} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
