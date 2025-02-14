
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
        <main className="p-4 lg:p-6 min-h-[calc(100vh-73px)]">
          <div className="max-w-[1600px] mx-auto space-y-4 lg:space-y-6">
            <DashboardHeader 
              selectedTimeRange={selectedTimeRange}
              setSelectedTimeRange={setSelectedTimeRange}
            />
            
            <MainMetrics dashboardStats={dashboardStats} />
            
            <StatusCards dashboardStats={dashboardStats} />
            
            <ChartSection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
