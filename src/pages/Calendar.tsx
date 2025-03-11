
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ProjectTimeline } from "@/components/Calendar/ProjectTimeline";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResourceAllocation } from "@/hooks/useResourceAllocation";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState<string>("projects");
  const [formattedProjects, setFormattedProjects] = useState<Project[]>([]);
  const { projects } = useProjects();
  const { teamMembers, getAvailability } = useResourceAllocation();
  const [teamAvailability, setTeamAvailability] = useState<any[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  
  // Formatar projetos para o formato esperado pelo componente ProjectTimeline
  useEffect(() => {
    if (projects && projects.length > 0) {
      const formatted = projects
        .filter(p => p.start_date && !p.deleted)
        .map(project => ({
          id: project.id,
          name: project.name,
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          endDate: project.expected_end_date ? new Date(project.expected_end_date) : 
                  project.due_date ? new Date(project.due_date) : 
                  new Date(new Date().setMonth(new Date().getMonth() + 1)),
          team: project.team_id || "Sem equipe",
          progress: project.progress || 0
        }));
      setFormattedProjects(formatted);
    }
  }, [projects]);

  // Carregar disponibilidade da equipe
  const loadTeamAvailability = async () => {
    if (!date) return;

    setIsLoadingAvailability(true);
    
    try {
      // Definir período para verificar disponibilidade (mês atual)
      const currentDate = new Date(date);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // Buscar disponibilidade para todos os membros da equipe
      const availability = await getAvailability(
        formattedStartDate,
        formattedEndDate,
        0
      );
      
      setTeamAvailability(availability);
    } catch (error) {
      console.error("Erro ao carregar disponibilidade:", error);
      toast.error("Erro ao carregar disponibilidade da equipe");
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Carregar disponibilidade quando a data muda ou o tab muda para "team"
  useEffect(() => {
    if (activeTab === "team" && date) {
      loadTeamAvailability();
    }
  }, [date, activeTab]);

  // Renderizar disponibilidade da equipe
  const renderTeamAvailability = () => {
    if (isLoadingAvailability) {
      return <div className="text-center py-8">Carregando disponibilidade...</div>;
    }
    
    if (!teamAvailability || teamAvailability.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="mb-4">Nenhuma informação de disponibilidade encontrada.</p>
          <Button onClick={loadTeamAvailability}>Verificar Disponibilidade</Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {teamAvailability.map(member => (
          <div key={member.member_id} className="border rounded-md p-4">
            <h3 className="font-medium text-lg mb-2">{member.member_name}</h3>
            <p className="text-sm text-gray-500 mb-3">{member.position}</p>
            
            <div className="grid grid-cols-7 gap-1">
              {member.available_dates
                .filter(d => {
                  const dateObj = new Date(d.date);
                  return dateObj.getMonth() === date?.getMonth();
                })
                .map(d => {
                  const dateObj = new Date(d.date);
                  const day = dateObj.getDate();
                  
                  // Calcular cor baseada na disponibilidade
                  let bgColor = "bg-red-100";
                  if (d.available_hours >= 8) {
                    bgColor = "bg-green-100";
                  } else if (d.available_hours >= 4) {
                    bgColor = "bg-yellow-100";
                  } else if (d.available_hours > 0) {
                    bgColor = "bg-orange-100";
                  }
                  
                  return (
                    <div key={d.date} 
                      className={`${bgColor} p-2 text-center rounded-sm`}
                      title={`${d.available_hours} horas disponíveis`}>
                      <span className="text-xs font-medium">{day}</span>
                      <div className="text-xs mt-1">{d.available_hours}h</div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendário</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="p-4 lg:col-span-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="rounded-md pointer-events-auto"
          />
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={loadTeamAvailability}
              disabled={isLoadingAvailability}>
              {isLoadingAvailability ? "Carregando..." : "Atualizar Disponibilidade"}
            </Button>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-8">
          <Tabs defaultValue="projects" onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="projects">Projetos</TabsTrigger>
              <TabsTrigger value="team">Disponibilidade da Equipe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Timeline de Projetos - {date ? format(date, "MMMM yyyy", { locale: ptBR }) : ""}
                </h2>
              </div>
              {formattedProjects.length > 0 ? (
                <ProjectTimeline projects={formattedProjects} selectedDate={date} />
              ) : (
                <div className="text-center py-8">
                  <p>Nenhum projeto encontrado com data de início definida.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="team" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Disponibilidade da Equipe - {date ? format(date, "MMMM yyyy", { locale: ptBR }) : ""}
                </h2>
              </div>
              {renderTeamAvailability()}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
