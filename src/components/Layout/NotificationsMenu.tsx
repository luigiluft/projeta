
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

// Simulando notificações - em um caso real, isso viria do backend
const notifications: Notification[] = [
  {
    id: "1",
    title: "Novo projeto criado",
    description: "Projeto 'Sistema de Gestão' foi criado com sucesso",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Tarefa atualizada",
    description: "A tarefa 'Implementar Login' foi atualizada",
    date: new Date().toISOString(),
    read: false,
  },
];

export function NotificationsMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative data-[state=open]:bg-white data-[state=open]:border-gray-200"
        >
          <Bell className="h-5 w-5" />
          {notifications.some(n => !n.read) && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold">Notificações</h3>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col space-y-1 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {notification.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(notification.date), "PP", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {notification.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
