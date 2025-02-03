import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart2, Calendar, ClipboardList, Settings, Users, ListTodo, Variable } from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: BarChart2, url: "/" },
  { title: "Projetos", icon: ClipboardList, url: "/projects" },
  { title: "Time", icon: Users, url: "/team" },
  { title: "Calendário", icon: Calendar, url: "/calendar" },
  { title: "Gestão de Tarefas", icon: ListTodo, url: "/task-management" },
  { title: "Atributos do Projeto", icon: Variable, url: "/project-attributes" },
  { title: "Configurações", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}