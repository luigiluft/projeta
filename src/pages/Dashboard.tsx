
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { 
  Activity, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  TimerOff,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { BurnupChart } from "@/components/Dashboard/BurnupChart";
import { CumulativeFlowChart } from "@/components/Dashboard/CumulativeFlowChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { DailyTasks } from "@/components/Dashboard/DailyTasks";
import { GanttChart } from "@/components/Dashboard/GanttChart";
import { AllocationChart } from "@/components/Dashboard/AllocationChart";
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
        .select(`
          project_id,
          project_name,
          status,
          total_tasks,
          total_hours,
          total_cost,
          base_cost,
          profit_margin,
          due_date,
          created_at,
          progress,
          delay_days,
          completed_tasks,
          in_progress_tasks,
          pending_tasks,
          hours_accuracy
        `);

      if (error) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const totalProjects = stats?.length || 0;
      const completedProjects = stats?.filter(s => s.status === 'completed').length || 0;
      const inProgressProjects = stats?.filter(s => s.status === 'in_progress').length || 0;
      const delayedProjects = stats?.filter(s => s.delay_days > 0).length || 0;
      
      const totalHours = stats?.reduce((sum, s) => sum + (s.total_hours || 0), 0) || 0;
      const totalCost = stats?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;
      const averageProgress = totalProjects > 0 
        ? (stats?.reduce((sum, s) => sum + (s.progress || 0), 0) || 0) / totalProjects 
        : 0;
      const averageAccuracy = totalProjects > 0
        ? (stats?.reduce((sum, s) => sum + (s.hours_accuracy || 0), 0) || 0) / totalProjects
        : 0;

      return {
        totalProjects,
        completedProjects,
        inProgressProjects,
        delayedProjects,
        totalHours,
        totalCost,
        averageProgress,
        averageAccuracy,
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
    return `${(value * 100).toFixed(1)}%`;
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Visão geral dos projetos</p>
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

            {/* Cards principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Em Andamento
                    </CardTitle>
                    <Target className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">
                        {dashboardStats?.inProgressProjects || 0}
                      </span>
                      <span className="text-sm text-green-600 flex items-center mt-1">
                        {formatPercentage(dashboardStats?.averageProgress || 0)} concluído
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Atrasados
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">
                        {dashboardStats?.delayedProjects || 0}
                      </span>
                      <span className="text-sm text-red-600 flex items-center mt-1">
                        Atenção necessária
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
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
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPercentage(dashboardStats?.averageAccuracy || 0)}
                      </span>
                      <span className="text-sm text-purple-600 flex items-center mt-1">
                        +8.2% este mês
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Concluídos
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">
                        {dashboardStats?.completedProjects || 0}
                      </span>
                      <span className="text-sm text-green-600 flex items-center mt-1">
                        +15.3% este mês
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos principais */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Alocação por Desenvolvedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <AllocationChart />
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Status dos Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectsPieChart />
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de tendência */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Burndown - Progresso vs. Planejado</CardTitle>
                </CardHeader>
                <CardContent>
                  <BurndownChart />
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Burnup - Entregas Acumuladas</CardTitle>
                </CardHeader>
                <CardContent>
                  <BurnupChart />
                </CardContent>
              </Card>
            </div>

            {/* Fluxo de trabalho */}
            <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Fluxo de Trabalho</CardTitle>
              </CardHeader>
              <CardContent>
                <CumulativeFlowChart />
              </CardContent>
            </Card>

            {/* Timeline e tarefas */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Timeline de Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                  <GanttChart tasks={[]} />
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Tarefas Críticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyTasks tasks={[]} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
