import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
  title: string;
  progress: number;
  team: string;
  dueDate: string;
}

export function ProjectCard({ title, progress, team, dueDate }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{team}</span>
            <span>Due {dueDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}