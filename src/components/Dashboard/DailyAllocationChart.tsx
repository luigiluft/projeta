
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Dados de exemplo - substituir por dados reais da API
const generateMockData = () => {
  const users = [
    { name: "João Silva", id: 1, role: "Frontend Developer" },
    { name: "Maria Santos", id: 2, role: "UX Designer" },
    { name: "Pedro Costa", id: 3, role: "Backend Developer" },
  ];

  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
    const allocations = users.map(user => ({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      allocated: Math.floor(Math.random() * 8) + 1,
      available: 8,
      projects: [
        { 
          name: "Projeto A", 
          hours: 3, 
          tasks: [
            { 
              name: "Desenvolvimento Frontend", 
              status: "Em andamento",
              priority: "Alta",
              deadline: new Date(date.getTime() + 1000 * 60 * 60 * 24),
              description: "Implementar nova interface do usuário"
            }
          ] 
        },
        { 
          name: "Projeto B", 
          hours: 4, 
          tasks: [
            { 
              name: "Code Review", 
              status: "Pendente",
              priority: "Média",
              deadline: new Date(date.getTime() + 1000 * 60 * 60 * 48),
              description: "Revisar PR #123 - Nova funcionalidade de login"
            }
          ] 
        },
      ]
    }));

    const totalHours = allocations.reduce((sum, a) => sum + a.allocated, 0);
    const availableHours = allocations.length * 8;

    return {
      date: format(date, "dd/MM", { locale: ptBR }),
      fullDate: date,
      allocations,
      totalHours,
      availableHours,
      occupancy: (totalHours / availableHours) * 100
    };
  });
};

export function DailyAllocationChart() {
  const [selectedDay, setSelectedDay] = useState<null | {
    date: Date;
    allocations: Array<{
      userId: number;
      userName: string;
      userRole: string;
      allocated: number;
      available: number;
      projects: Array<{
        name: string;
        hours: number;
        tasks: Array<{
          name: string;
          status: string;
          priority: string;
          deadline: Date;
          description: string;
        }>;
      }>;
    }>;
  }>(null);

  const data = generateMockData();

  const handleBarClick = (dayData: any) => {
    setSelectedDay({
      date: dayData.fullDate,
      allocations: dayData.allocations
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "em andamento":
        return "bg-blue-100 text-blue-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "concluído":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "bg-red-100 text-red-800";
      case "média":
        return "bg-yellow-100 text-yellow-800";
      case "baixa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Alocação Diária da Equipe</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-purple-500"></div>
            <span>Horas Alocadas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-gray-200"></div>
            <span>Horas Disponíveis</span>
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            onClick={(data) => handleBarClick(data.activePayload?.[0]?.payload)}
            barGap={0}
          >
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="availableHours"
              stackId="a"
              fill="#E2E8F0"
              name="Horas Disponíveis"
            />
            <Bar
              dataKey="totalHours"
              stackId="b"
              fill="#8B5CF6"
              name="Horas Alocadas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Sheet open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              Alocações para {selectedDay && format(selectedDay.date, "dd 'de' MMMM", { locale: ptBR })}
            </SheetTitle>
            <SheetDescription>
              Detalhes de alocação e tarefas por membro da equipe
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
            <div className="mt-6 space-y-8">
              {selectedDay?.allocations.map((allocation) => (
                <div key={allocation.userId} className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-lg">{allocation.userName}</h4>
                    <p className="text-sm text-gray-500">{allocation.userRole}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-500">Horas Alocadas</p>
                      <p className="font-medium">{allocation.allocated}h</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Horas Disponíveis</p>
                      <p className="font-medium">{allocation.available - allocation.allocated}h</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {allocation.projects.map((project, projectIdx) => (
                      <div key={projectIdx} className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{project.name}</h5>
                          <Badge variant="outline">{project.hours}h</Badge>
                        </div>

                        <div className="space-y-3">
                          {project.tasks.map((task, taskIdx) => (
                            <div key={taskIdx} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h6 className="font-medium">{task.name}</h6>
                                <div className="flex gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                                    {task.status}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{task.description}</p>
                              <p className="text-xs text-gray-500">
                                Prazo: {format(task.deadline, "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
