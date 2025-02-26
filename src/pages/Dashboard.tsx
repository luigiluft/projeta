
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
import { DailyAllocationChart } from "@/components/Dashboard/DailyAllocationChart";
import { DailyTasks } from "@/components/Dashboard/DailyTasks";
import { ProjectStats } from "@/types/project";

const Dashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d");

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', selectedTimeRange],
    queryFn: async () => {
      const { data: stats, error } = await supabase
        .rpc('get_project_stats') as { data: ProjectStats[], error: Error | null };

      if (error) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const safeStats = stats || [];

      // Financial Metrics
      const totalRevenue = safeStats.reduce((sum, s) => sum + (s.total_cost || 0), 0);
      const totalCost = safeStats.reduce((sum, s) => sum + (s.base_cost || 0), 0);
      const totalProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const averageProjectValue = totalRevenue / (safeStats.length || 1);

      // Project Performance
      const totalProjects = safeStats.length;
      const activeProjects = safeStats.filter(s => s.status === 'in_progress').length;
      const delayedProjects = safeStats.filter(s => (s.delay_days || 0) > 0).length;
      const completedProjects = safeStats.filter(s => s.status === 'completed').length;
      const projectSuccessRate = (completedProjects / totalProjects) * 100;

      // Time Management
      const totalHours = safeStats.reduce((sum, s) => sum + (s.total_hours || 0), 0);
      const averageProjectDuration = totalHours / totalProjects;
      const averageAccuracy = totalProjects > 0
        ? (safeStats.reduce((sum, s) => sum + (s.hours_accuracy || 0), 0)) / totalProjects
        : 0;

      // Task Management
      const totalTasks = safeStats.reduce((sum, s) => sum + (s.total_tasks || 0), 0);
      const completedTasks = safeStats.reduce((sum, s) => sum + (s.completed_tasks || 0), 0);
      const inProgressTasks = safeStats.reduce((sum, s) => sum + (s.in_progress_tasks || 0), 0);
      const pendingTasks = safeStats.reduce((sum, s) => sum + (s.pending_tasks || 0), 0);
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Resource Management
      const resourceUtilization = (inProgressTasks / (totalTasks || 1)) * 100;
      const averageDelay = safeStats.reduce((sum, s) => sum + (s.delay_days || 0), 0) / totalProjects;

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
        projectStats: stats as ProjectStats[],
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
    <div className="max-w-[1200px] w-full mx-auto px-4 lg:px-6 py-6">
      <DashboardHeader 
        selectedTimeRange={selectedTimeRange}
        setSelectedTimeRange={setSelectedTimeRange}
      />
      
      <div className="mt-4 grid gap-4 pb-6">
        <MainMetrics dashboardStats={dashboardStats} />
        <StatusCards dashboardStats={dashboardStats} />
        <div className="grid gap-4 lg:grid-cols-2">
          <PerformanceMetrics dashboardStats={dashboardStats} />
          <TeamMetrics dashboardStats={dashboardStats} />
        </div>
        <DailyTasks />
        <DailyAllocationChart />
        <ChartSection projectStats={dashboardStats?.projectStats || []} />
      </div>
    </div>
  );
}

export default Dashboard;
