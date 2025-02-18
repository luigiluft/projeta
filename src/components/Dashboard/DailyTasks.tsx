
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Task {
  id: string;
  name: string;
  project: string;
  assignee: string;
  role: string;
  status: string;
  startTime: string;
  endTime: string;
  priority: string;
}

// Mock data - replace with real API data later
const mockTasks: Task[] = [
  {
    id: "1",
    name: "Implementar Dashboard",
    project: "Sistema de Gestão",
    assignee: "João Silva",
    role: "Frontend Developer",
    status: "em_andamento",
    startTime: "09:00",
    endTime: "12:00",
    priority: "alta"
  },
  {
    id: "2",
    name: "Design da Landing Page",
    project: "Website Institucional",
    assignee: "Maria Santos",
    role: "UX Designer",
    status: "em_andamento",
    startTime: "10:00",
    endTime: "15:00",
    priority: "media"
  },
  {
    id: "3",
    name: "API de Integração",
    project: "Sistema de Gestão",
    assignee: "Pedro Costa",
    role: "Backend Developer",
    status: "pendente",
    startTime: "13:00",
    endTime: "17:00",
    priority: "alta"
  }
];

export function DailyTasks() {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      em_andamento: "bg-blue-100 text-blue-800 border-blue-200",
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      concluido: "bg-green-100 text-green-800 border-green-200"
    };
    return statusConfig[status as keyof typeof statusConfig] || "";
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      alta: "bg-red-100 text-red-800 border-red-200",
      media: "bg-yellow-100 text-yellow-800 border-yellow-200",
      baixa: "bg-green-100 text-green-800 border-green-200"
    };
    return priorityConfig[priority as keyof typeof priorityConfig] || "";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-lg font-medium">
          Tarefas do Dia ({format(new Date(), "dd 'de' MMMM", { locale: ptBR })})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{task.name}</div>
                    <div className="text-xs text-muted-foreground">{task.role}</div>
                  </div>
                </TableCell>
                <TableCell>{task.project}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{task.assignee}</div>
                    <div className="text-xs text-muted-foreground">{task.role}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {task.startTime} - {task.endTime}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadge(task.status)}>
                    {task.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPriorityBadge(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
