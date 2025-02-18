
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPercentage } from "@/utils/format";

interface PerformanceMetricsProps {
  dashboardStats: {
    projectSuccessRate: number;
    taskCompletionRate: number;
    resourceUtilization: number;
    averageAccuracy: number;
  };
}

export const PerformanceMetrics = ({ dashboardStats }: PerformanceMetricsProps) => {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Project Success Rate</span>
            <span className="font-medium">{formatPercentage(dashboardStats.projectSuccessRate)}</span>
          </div>
          <Progress value={dashboardStats.projectSuccessRate} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Task Completion Rate</span>
            <span className="font-medium">{formatPercentage(dashboardStats.taskCompletionRate)}</span>
          </div>
          <Progress value={dashboardStats.taskCompletionRate} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Resource Utilization</span>
            <span className="font-medium">{formatPercentage(dashboardStats.resourceUtilization)}</span>
          </div>
          <Progress value={dashboardStats.resourceUtilization} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimation Accuracy</span>
            <span className="font-medium">{formatPercentage(dashboardStats.averageAccuracy)}</span>
          </div>
          <Progress value={dashboardStats.averageAccuracy} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
