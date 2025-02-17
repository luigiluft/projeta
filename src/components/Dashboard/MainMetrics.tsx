
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Performance Financeira</p>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.totalRevenue)}
                </span>
                <span className="text-sm text-emerald-600 flex items-center mt-1">
                  Margem: {formatPercentage(dashboardStats.profitMargin)}
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <Progress value={dashboardStats.profitMargin} className="h-1.5 mt-4" />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Gestão de Projetos</p>
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
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <Progress 
            value={(dashboardStats.activeProjects / dashboardStats.totalProjects) * 100} 
            className="h-1.5 mt-4" 
          />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Precisão das Estimativas</p>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardStats.averageAccuracy)}
                </span>
                <span className="text-sm text-purple-600 flex items-center mt-1">
                  Média de Assertividade
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <Progress value={dashboardStats.averageAccuracy} className="h-1.5 mt-4" />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Produtividade</p>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardStats.taskCompletionRate)}
                </span>
                <span className="text-sm text-green-600 flex items-center mt-1">
                  Taxa de Conclusão
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <Progress value={dashboardStats.taskCompletionRate} className="h-1.5 mt-4" />
        </CardContent>
      </Card>
    </div>
  );
};
