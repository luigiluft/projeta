
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
    <Sidebar className="bg-white border-r fixed h-full" variant="sidebar" collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-medium">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-2 ${location.pathname === item.url ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
                      data-active={location.pathname === item.url}
                    >
                      <item.icon className={`h-5 w-5 ${location.pathname === item.url ? 'text-blue-700' : 'text-gray-600'}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-2 text-gray-700 hover:bg-blue-50">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <span>Configurações</span>
                    </SidebarMenuButton>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" align="start" className="w-48 bg-white">
                    <nav className="space-y-2">
                      <Link 
                        to="/import" 
                        className="block w-full p-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Importação de dados
                      </Link>
                      <Link 
                        to="/user-approval" 
                        className="block w-full p-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Usuários
                      </Link>
                      <Link 
                        to="/role-management" 
                        className="block w-full p-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
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
