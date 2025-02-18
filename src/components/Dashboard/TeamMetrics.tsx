
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamMetricsProps {
  dashboardStats: {
    activeProjects: number;
    totalProjects: number;
    inProgressTasks: number;
    pendingTasks: number;
    completedTasks: number;
    averageDelay: number;
  };
}

export const TeamMetrics = ({ dashboardStats }: TeamMetricsProps) => {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Team Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Active Projects</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{dashboardStats.activeProjects}</span>
                <Badge variant="secondary">
                  of {dashboardStats.totalProjects}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Average Delay</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{Math.round(dashboardStats.averageDelay)}</span>
                <Badge variant="secondary">days</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Task Distribution</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-xl font-bold text-blue-600">{dashboardStats.inProgressTasks}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{dashboardStats.pendingTasks}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-bold text-green-600">{dashboardStats.completedTasks}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
