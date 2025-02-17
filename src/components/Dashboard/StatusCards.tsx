
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
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Total de Horas</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(dashboardStats.totalHours)}h</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
              <CalendarClock className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Projetos Atrasados</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.delayedProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Projetos Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedProjects}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Lucro Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.totalProfit)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
