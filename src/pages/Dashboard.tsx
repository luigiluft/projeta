
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Users,
  CalendarClock,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { AllocationChart } from "@/components/Dashboard/AllocationChart";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const timeRanges = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "15d", label: "Últimos 15 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
];

const Index = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d");

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: stats, error } = await supabase
        .from('project_stats')
        .select('*');

      if (error) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const totalProjects = stats?.length || 0;
      const activeProjects = stats?.filter(s => s.status === 'in_progress').length || 0;
      const delayedProjects = stats?.filter(s => s.delay_days > 0).length || 0;
      const completedProjects = stats?.filter(s => s.status === 'completed').length || 0;
      
      const totalRevenue = stats?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;
      const totalCost = stats?.reduce((sum, s) => sum + (s.base_cost || 0), 0) || 0;
      const totalProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      const totalHours = stats?.reduce((sum, s) => sum + (s.total_hours || 0), 0) || 0;
      const averageAccuracy = totalProjects > 0
        ? (stats?.reduce((sum, s) => sum + (s.hours_accuracy || 0), 0) || 0) / totalProjects
        : 0;

      const totalTasks = stats?.reduce((sum, s) => sum + (s.total_tasks || 0), 0) || 0;
      const completedTasks = stats?.reduce((sum, s) => sum + (s.completed_tasks || 0), 0) || 0;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        totalProjects,
        activeProjects,
        delayedProjects,
        completedProjects,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        totalHours,
        averageAccuracy,
        taskCompletionRate,
        projectStats: stats || [],
      };
    },
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-gray-50/80">
      <AppSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8 min-h-[calc(100vh-73px)]">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Cabeçalho e filtros */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Análise de Performance</p>
              </div>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indicadores Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Performance Financeira */}
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
                        {formatCurrency(dashboardStats?.totalRevenue || 0)}
                      </span>
                      <span className="text-sm text-emerald-600 flex items-center mt-1">
                        Margem: {formatPercentage(dashboardStats?.profitMargin || 0)}
                      </span>
                    </div>
                    <Progress 
                      value={dashboardStats?.profitMargin || 0} 
                      className="h-1.5" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Projetos Ativos */}
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
                          {dashboardStats?.activeProjects || 0}
                        </span>
                        <span className="text-sm text-gray-500">
                          de {dashboardStats?.totalProjects || 0}
                        </span>
                      </div>
                      <span className="text-sm text-blue-600 flex items-center mt-1">
                        Projetos em Andamento
                      </span>
                    </div>
                    <Progress 
                      value={(dashboardStats?.activeProjects || 0) / (dashboardStats?.totalProjects || 1) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Precisão das Estimativas */}
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
                        {formatPercentage(dashboardStats?.averageAccuracy || 0)}
                      </span>
                      <span className="text-sm text-purple-600 flex items-center mt-1">
                        Média de Assertividade
                      </span>
                    </div>
                    <Progress 
                      value={dashboardStats?.averageAccuracy || 0} 
                      className="h-1.5" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Taxa de Conclusão */}
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
                        {formatPercentage(dashboardStats?.taskCompletionRate || 0)}
                      </span>
                      <span className="text-sm text-green-600 flex items-center mt-1">
                        Taxa de Conclusão
                      </span>
                    </div>
                    <Progress 
                      value={dashboardStats?.taskCompletionRate || 0} 
                      className="h-1.5" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cards de Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Total de Horas</p>
                      <p className="text-2xl font-semibold">{Math.round(dashboardStats?.totalHours || 0)}h</p>
                    </div>
                    <CalendarClock className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Projetos Atrasados</p>
                      <p className="text-2xl font-semibold">{dashboardStats?.delayedProjects || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Projetos Concluídos</p>
                      <p className="text-2xl font-semibold">{dashboardStats?.completedProjects || 0}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Lucro Total</p>
                      <p className="text-2xl font-semibold">{formatCurrency(dashboardStats?.totalProfit || 0)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
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

            {/* Tendências */}
            <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Tendência de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <BurndownChart />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
