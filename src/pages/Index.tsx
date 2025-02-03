import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Activity, Clock, Target, Users } from "lucide-react";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { BurnupChart } from "@/components/Dashboard/BurnupChart";
import { CumulativeFlowChart } from "@/components/Dashboard/CumulativeFlowChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyTasks } from "@/components/Dashboard/DailyTasks";
import { GanttChart } from "@/components/Dashboard/GanttChart";
import { AllocationChart } from "@/components/Dashboard/AllocationChart";
import { useState } from "react";

const projects = [
  {
    title: "Redesenho do Website",
    progress: 75,
    team: "Time de Design",
    dueDate: "20 Dez",
  },
  {
    title: "Desenvolvimento App Mobile",
    progress: 45,
    team: "Time de Dev",
    dueDate: "15 Jan",
  },
  {
    title: "Campanha de Marketing",
    progress: 90,
    team: "Marketing",
    dueDate: "10 Dez",
  },
];

const tasks = [
  {
    id: "1",
    title: "Revisar mockups do design do site",
    dueTime: "14:00",
    completed: false,
    project: "Redesenho do Website",
  },
  {
    id: "2",
    title: "Daily do time",
    dueTime: "10:00",
    completed: true,
    project: "Desenvolvimento App Mobile",
  },
  {
    id: "3",
    title: "Atualizar documentação do projeto",
    dueTime: "16:30",
    completed: false,
    project: "Desenvolvimento App Mobile",
  },
  {
    id: "4",
    title: "Reunião com cliente - App Mobile",
    dueTime: "11:30",
    completed: true,
    project: "Desenvolvimento App Mobile",
  },
];

const timeRanges = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "15d", label: "Últimos 15 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
];

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d");

  const filteredTasks = selectedProject
    ? tasks.filter((task) => task.project === selectedProject)
    : tasks;

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 bg-gray-50 min-h-[calc(100vh-73px)]">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Total de Projetos"
                value="12"
                icon={Target}
              />
              <StatsCard
                title="Tarefas Ativas"
                value="48"
                icon={Activity}
              />
              <StatsCard
                title="Membros do Time"
                value="8"
                icon={Users}
              />
              <StatsCard
                title="Horas Registradas"
                value="164"
                icon={Clock}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecione um projeto para filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>Todos os projetos</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.title} value={project.title}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-center">Distribuição de Horas por Projeto</h3>
              <div className="flex justify-center items-center w-full">
                <div className="w-[400px]">
                  <ProjectsPieChart />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Alocação de Horas por Funcionário</h3>
              <AllocationChart />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">📊 Gráfico de Burndown</h3>
                <BurndownChart />
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">📈 Burnup Chart</h3>
                <BurnupChart />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">📉 Cumulative Flow Diagram (CFD)</h3>
              <div className="flex justify-center items-center w-full">
                <div className="w-[800px]">
                  <CumulativeFlowChart />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Cronograma do Dia</h3>
                <GanttChart tasks={filteredTasks} />
              </div>
              <div className="bg-white rounded-lg shadow">
                <DailyTasks tasks={filteredTasks} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
