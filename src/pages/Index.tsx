import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Activity, Clock, Target, Users } from "lucide-react";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyTasks } from "@/components/Dashboard/DailyTasks";

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

const Index = () => {
  return (
    <SidebarProvider>
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

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Distribuição de Horas por Projeto</h3>
                  <ProjectsPieChart />
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Gráfico de Burndown</h3>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione o projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.title} value={project.title}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <BurndownChart />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-lg shadow">
                  <DailyTasks />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;