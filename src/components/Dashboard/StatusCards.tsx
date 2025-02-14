
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, BarChart3, CalendarClock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";

interface StatusCardsProps {
  dashboardStats: {
    totalHours: number;
    delayedProjects: number;
    completedProjects: number;
    totalProfit: number;
  };
}

export const StatusCards = ({ dashboardStats }: StatusCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Total de Horas</p>
              <p className="text-2xl font-semibold">{Math.round(dashboardStats.totalHours)}h</p>
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
              <p className="text-2xl font-semibold">{dashboardStats.delayedProjects}</p>
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
              <p className="text-2xl font-semibold">{dashboardStats.completedProjects}</p>
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
              <p className="text-2xl font-semibold">{formatCurrency(dashboardStats.totalProfit)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
