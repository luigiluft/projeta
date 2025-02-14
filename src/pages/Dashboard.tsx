
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { 
  Activity, 
  Clock, 
  DollarSign, 
  Target, 
  Users, 
  ChevronUp, 
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  TimerOff,
  Loader2
} from "lucide-react";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { BurnupChart } from "@/components/Dashboard/BurnupChart";
import { CumulativeFlowChart } from "@/components/Dashboard/CumulativeFlowChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyTasks } from "@/components/Dashboard/DailyTasks";
import { GanttChart } from "@/components/Dashboard/GanttChart";
import { AllocationChart } from "@/components/Dashboard/AllocationChart";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectStats } from "@/types/project";

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
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 bg-gray-50 min-h-[calc(100vh-73px)]">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[200px]">
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

            {/* KPIs principais */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Projetos em Andamento"
                value={(dashboardStats?.inProgressProjects || 0).toString()}
                icon={Target}
                trend={{
                  value: formatPercentage(dashboardStats?.averageProgress || 0),
                  positive: true,
                  icon: ChevronUp,
                }}
              />
              <StatsCard
                title="Projetos Atrasados"
                value={(dashboardStats?.delayedProjects || 0).toString()}
                icon={AlertTriangle}
                trend={{
                  value: "Ação necessária",
                  positive: false,
                  icon: TimerOff,
                }}
              />
              <StatsCard
                title="Precisão das Estimativas"
                value={formatPercentage(dashboardStats?.averageAccuracy || 0)}
                icon={Clock}
                trend={{
                  value: "+8.2%",
                  positive: true,
                  icon: ChevronUp,
                }}
              />
              <StatsCard
                title="Projetos Concluídos"
                value={(dashboardStats?.completedProjects || 0).toString()}
                icon={CheckCircle2}
                trend={{
                  value: "+15.3%",
                  positive: true,
                  icon: ChevronUp,
                }}
              />
            </div>

            {/* Gráficos de progresso e alocação */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Alocação por Desenvolvedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <AllocationChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status dos Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectsPieChart />
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Burndown e Burnup */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Burndown - Progresso vs. Planejado</CardTitle>
                </CardHeader>
                <CardContent>
                  <BurndownChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Burnup - Entregas Acumuladas</CardTitle>
                </CardHeader>
                <CardContent>
                  <BurnupChart />
                </CardContent>
              </Card>
            </div>

            {/* Fluxo cumulativo e timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Trabalho</CardTitle>
              </CardHeader>
              <CardContent>
                <CumulativeFlowChart />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline de Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                  <GanttChart tasks={[]} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas Críticas</CardTitle>
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
