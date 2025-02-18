
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { MainMetrics } from "@/components/Dashboard/MainMetrics";
import { StatusCards } from "@/components/Dashboard/StatusCards";
import { ChartSection } from "@/components/Dashboard/ChartSection";
import { PerformanceMetrics } from "@/components/Dashboard/PerformanceMetrics";
import { TeamMetrics } from "@/components/Dashboard/TeamMetrics";

const Dashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d");

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', selectedTimeRange],
    queryFn: async () => {
      const { data: stats, error } = await supabase
        .from('project_stats')
        .select('*');

      if (error) {
        throw new Error('Erro ao carregar estatísticas');
      }

      // Financial Metrics
      const totalRevenue = stats?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;
      const totalCost = stats?.reduce((sum, s) => sum + (s.base_cost || 0), 0) || 0;
      const totalProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const averageProjectValue = totalRevenue / (stats?.length || 1);

      // Project Performance
      const totalProjects = stats?.length || 0;
      const activeProjects = stats?.filter(s => s.status === 'in_progress').length || 0;
      const delayedProjects = stats?.filter(s => s.delay_days > 0).length || 0;
      const completedProjects = stats?.filter(s => s.status === 'completed').length || 0;
      const projectSuccessRate = (completedProjects / totalProjects) * 100;

      // Time Management
      const totalHours = stats?.reduce((sum, s) => sum + (s.total_hours || 0), 0) || 0;
      const averageProjectDuration = totalHours / totalProjects;
      const averageAccuracy = totalProjects > 0
        ? (stats?.reduce((sum, s) => sum + (s.hours_accuracy || 0), 0) || 0) / totalProjects
        : 0;

      // Task Management
      const totalTasks = stats?.reduce((sum, s) => sum + (s.total_tasks || 0), 0) || 0;
      const completedTasks = stats?.reduce((sum, s) => sum + (s.completed_tasks || 0), 0) || 0;
      const inProgressTasks = stats?.reduce((sum, s) => sum + (s.in_progress_tasks || 0), 0) || 0;
      const pendingTasks = stats?.reduce((sum, s) => sum + (s.pending_tasks || 0), 0) || 0;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Resource Management
      const resourceUtilization = (inProgressTasks / (totalTasks || 1)) * 100;
      const averageDelay = stats?.reduce((sum, s) => sum + (s.delay_days || 0), 0) / totalProjects || 0;

      return {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        averageProjectValue,
        totalProjects,
        activeProjects,
        delayedProjects,
        completedProjects,
        projectSuccessRate,
        totalHours,
        averageProjectDuration,
        averageAccuracy,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        taskCompletionRate,
        resourceUtilization,
        averageDelay,
        projectStats: stats || [],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50/80">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
            <DashboardHeader 
              selectedTimeRange={selectedTimeRange}
              setSelectedTimeRange={setSelectedTimeRange}
            />
            
            <div className="mt-4 grid gap-4">
              <MainMetrics dashboardStats={dashboardStats} />
              <StatusCards dashboardStats={dashboardStats} />
              <div className="grid gap-4 lg:grid-cols-2">
                <PerformanceMetrics dashboardStats={dashboardStats} />
                <TeamMetrics dashboardStats={dashboardStats} />
              </div>
              <ChartSection projectStats={dashboardStats.projectStats} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
