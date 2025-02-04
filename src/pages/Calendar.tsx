import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ProjectTimeline } from "@/components/Calendar/ProjectTimeline";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Project {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  team: string;
  progress: number;
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Projeto A",
      startDate: new Date(2024, 3, 1),
      endDate: new Date(2024, 4, 15),
      team: "Time Alpha",
      progress: 30,
    },
    {
      id: "2",
      name: "Projeto B",
      startDate: new Date(2024, 3, 15),
      endDate: new Date(2024, 5, 30),
      team: "Time Beta",
      progress: 15,
    },
  ]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendário de Projetos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="p-4 lg:col-span-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="rounded-md"
          />
        </Card>

        <Card className="p-4 lg:col-span-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Timeline de Projetos - {date ? format(date, "MMMM yyyy", { locale: ptBR }) : ""}
              </h2>
            </div>
            <ProjectTimeline projects={projects} selectedDate={date} />
          </div>
        </Card>
      </div>
    </div>
  );
}