import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { ProjectCard } from "@/components/Dashboard/ProjectCard";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Activity, Clock, Target, Users } from "lucide-react";
import { BurndownChart } from "@/components/Dashboard/BurndownChart";
import { ProjectsPieChart } from "@/components/Dashboard/ProjectsPieChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const projects = [
  {
    title: "Website Redesign",
    progress: 75,
    team: "Design Team",
    dueDate: "Dec 20",
  },
  {
    title: "Mobile App Development",
    progress: 45,
    team: "Dev Team",
    dueDate: "Jan 15",
  },
  {
    title: "Marketing Campaign",
    progress: 90,
    team: "Marketing",
    dueDate: "Dec 10",
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
                  title="Total Projects"
                  value="12"
                  icon={Target}
                />
                <StatsCard
                  title="Active Tasks"
                  value="48"
                  icon={Activity}
                />
                <StatsCard
                  title="Team Members"
                  value="8"
                  icon={Users}
                />
                <StatsCard
                  title="Hours Tracked"
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
                    <h3 className="text-lg font-semibold">Burndown Chart</h3>
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

              <h2 className="text-2xl font-bold">Active Projects</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.title} {...project} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;