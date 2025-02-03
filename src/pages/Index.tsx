import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Header } from "@/components/Layout/Header";
import { ProjectCard } from "@/components/Dashboard/ProjectCard";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Activity, Clock, Target, Users } from "lucide-react";

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