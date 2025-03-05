
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
import { ClipboardList, Settings, Users, ListTodo, Variable, Calendar, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Projetos", icon: ClipboardList, url: "/projects" },
  { title: "Time", icon: Users, url: "/team" },
  { title: "Calendário", icon: Calendar, url: "/calendar" },
  { title: "Gestão de Tarefas", icon: ListTodo, url: "/task-management" },
  { title: "Atributos do Projeto", icon: Variable, url: "/project-attributes" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-white border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-2"
                      data-active={location.pathname === item.url}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      <span>Configurações</span>
                    </SidebarMenuButton>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" align="start" className="w-48 bg-white">
                    <nav className="space-y-2">
                      <Link 
                        to="/import" 
                        className="block w-full p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Importação de dados
                      </Link>
                      <Link 
                        to="/user-approval" 
                        className="block w-full p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Usuários
                      </Link>
                      <Link 
                        to="/role-management" 
                        className="block w-full p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Permissões
                      </Link>
                    </nav>
                  </HoverCardContent>
                </HoverCard>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
