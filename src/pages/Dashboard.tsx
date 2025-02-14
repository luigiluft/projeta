
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Activity, Clock, DollarSign, Target, Users, ChevronUp, ChevronDown } from "lucide-react";
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

const timeRanges = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "15d", label: "Últimos 15 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
];

const Index = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d");

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (projectsError || tasksError) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const totalProjects = projects?.length || 0;
      const totalTasks = tasks?.length || 0;
      const totalHours = tasks?.reduce((sum, task) => sum + (task.hours || 0), 0) || 0;
      const totalCost = projects?.reduce((sum, project) => sum + (project.total_cost || 0), 0) || 0;

      return {
        totalProjects,
        totalTasks,
        totalHours,
        totalCost,
      };
    },
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

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

            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Total de Projetos"
                value={dashboardStats?.totalProjects.toString() || "0"}
                icon={Target}
                trend={{
                  value: "+12.5%",
                  positive: true,
                  icon: ChevronUp,
                }}
              />
              <StatsCard
                title="Tarefas Ativas"
                value={dashboardStats?.totalTasks.toString() || "0"}
                icon={Activity}
                trend={{
                  value: "-4.5%",
                  positive: false,
                  icon: ChevronDown,
                }}
              />
              <StatsCard
                title="Horas Registradas"
                value={`${dashboardStats?.totalHours.toFixed(1)}h` || "0h"}
                icon={Clock}
                trend={{
                  value: "+8.2%",
                  positive: true,
                  icon: ChevronUp,
                }}
              />
              <StatsCard
                title="Faturamento Total"
                value={formatCurrency(dashboardStats?.totalCost || 0)}
                icon={DollarSign}
                trend={{
                  value: "+15.3%",
                  positive: true,
                  icon: ChevronUp,
                }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Horas por Projeto</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectsPieChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alocação por Funcionário</CardTitle>
                </CardHeader>
                <CardContent>
                  <AllocationChart />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Burndown Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <BurndownChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Burnup Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <BurnupChart />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fluxo Cumulativo</CardTitle>
              </CardHeader>
              <CardContent>
                <CumulativeFlowChart />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cronograma do Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <GanttChart tasks={[]} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas do Dia</CardTitle>
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
