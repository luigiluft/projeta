import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  dueTime: string;
  completed: boolean;
}

interface DailyTasksProps {
  tasks: Task[];
}

export function DailyTasks({ tasks }: DailyTasksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tarefas do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                    task.completed
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  }`}
                >
                  {task.completed && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span
                  className={`${
                    task.completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <span
                className={`text-sm ${
                  task.completed ? "text-muted-foreground" : "text-primary"
                }`}
              >
                {task.dueTime}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}