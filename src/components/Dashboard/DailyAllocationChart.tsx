
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
import { Bar, BarChart, XAxis, YAxis } from "recharts";

// Dados de exemplo - substituir por dados reais da API
const generateMockData = () => {
  const users = [
    { name: "João Silva", id: 1 },
    { name: "Maria Santos", id: 2 },
    { name: "Pedro Costa", id: 3 },
  ];

  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
    const allocations = users.map(user => ({
      userId: user.id,
      userName: user.name,
      allocated: Math.floor(Math.random() * 8) + 1,
      available: 8,
      projects: [
        { name: "Projeto A", hours: 3, tasks: ["Desenvolvimento", "Code Review"] },
        { name: "Projeto B", hours: 4, tasks: ["Design", "Documentação"] },
      ]
    }));

    return {
      date: format(date, "dd/MM", { locale: ptBR }),
      fullDate: date,
      allocations
    };
  });
};

export function DailyAllocationChart() {
  const [selectedDay, setSelectedDay] = useState<null | {
    date: Date;
    allocations: Array<{
      userId: number;
      userName: string;
      allocated: number;
      available: number;
      projects: Array<{
        name: string;
        hours: number;
        tasks: string[];
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

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold">Alocação Diária da Equipe</h3>
      <div className="h-[400px] w-full">
        <ChartContainer
          className="h-full w-full"
          config={{
            allocated: {
              theme: {
                light: "#8B5CF6",
                dark: "#8B5CF6",
              },
            },
            available: {
              theme: {
                light: "#E2E8F0",
                dark: "#E2E8F0",
              },
            },
          }}
        >
          <BarChart data={data} onClick={(data) => handleBarClick(data.activePayload?.[0]?.payload)}>
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="allocations"
              name="Horas Alocadas"
              fill="#8B5CF6"
              stackId="a"
              onClick={handleBarClick}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <Sheet open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              Alocação do dia {selectedDay && format(selectedDay.date, "dd 'de' MMMM", { locale: ptBR })}
            </SheetTitle>
            <SheetDescription>
              Detalhes de alocação por membro da equipe
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {selectedDay?.allocations.map((allocation) => (
              <div key={allocation.userId} className="space-y-4">
                <h4 className="font-medium">{allocation.userName}</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Horas Alocadas:</span>
                    <span className="font-medium">{allocation.allocated}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Horas Disponíveis:</span>
                    <span className="font-medium">{allocation.available - allocation.allocated}h</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Projetos do dia:</h5>
                  {allocation.projects.map((project, idx) => (
                    <div key={idx} className="rounded-lg bg-gray-50 p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-sm">{project.hours}h</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.tasks.map((task, taskIdx) => (
                          <span 
                            key={taskIdx}
                            className="text-xs bg-white px-2 py-1 rounded-full border"
                          >
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
