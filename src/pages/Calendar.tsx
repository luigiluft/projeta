
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ProjectTimeline } from "@/components/Calendar/ProjectTimeline";
import { format, parseISO, addDays, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [teamAvailability, setTeamAvailability] = useState<any[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  
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

  const loadTeamAvailability = async () => {
    if (!date) return;

    setIsLoadingAvailability(true);
    
    try {
      const currentDate = new Date(date);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // Buscar membros da equipe diretamente
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id, name, position')
        .order('name');
        
      if (teamError) {
        console.error("Erro ao buscar membros da equipe:", teamError);
        throw teamError;
      }
      
      // Criar estrutura de disponibilidade simplificada
      // Aqui poderíamos buscar do banco, mas estamos criando dados simulados
      const memberAvailability = teamMembers.map(member => {
        const daysInMonth = getDaysInMonth(currentDate);
        const availableDates = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
          const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          
          // Dias de semana têm mais horas disponíveis
          const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;
          const baseHours = isWeekend ? 0 : 8;
          
          // Simular variação na disponibilidade
          const randomFactor = Math.random() * 2 - 0.5; // Entre -0.5 e 1.5
          const availableHours = Math.max(0, Math.min(10, baseHours + randomFactor));
          
          availableDates.push({
            date: format(currentDay, 'yyyy-MM-dd'),
            available_hours: isWeekend ? 0 : availableHours,
            allocated_hours: Math.random() > 0.7 ? Math.random() * 4 : 0, // Algumas alocações aleatórias
            allocations: []
          });
        }
        
        return {
          member_id: member.id,
          member_name: member.name,
          position: member.position,
          available_dates: availableDates
        };
      });

      const { data: projectAllocations, error: allocationsError } = await supabase
        .from('project_allocations')
        .select(`
          id, 
          member_id, 
          start_date, 
          end_date, 
          allocated_hours,
          status,
          projects:project_id(name)
        `)
        .or(`start_date.lte.${formattedEndDate},end_date.gte.${formattedStartDate}`);
        
      if (allocationsError) {
        console.error("Erro ao buscar alocações:", allocationsError);
        throw allocationsError;
      }

      const processedAvailability = memberAvailability.map(member => {
        const memberAllocations = projectAllocations?.filter(
          alloc => alloc.member_id === member.member_id
        ) || [];

        const updatedDates = member.available_dates.map(day => {
          const dayDate = new Date(day.date);
          let hoursAllocated = 0;
          
          memberAllocations.forEach(alloc => {
            const allocStart = new Date(alloc.start_date);
            const allocEnd = new Date(alloc.end_date);
            
            if (dayDate >= allocStart && dayDate <= allocEnd) {
              const allocDays = Math.max(1, Math.round((allocEnd.getTime() - allocStart.getTime()) / (1000 * 60 * 60 * 24))) || 1;
              const hoursPerDay = alloc.allocated_hours / allocDays;
              
              hoursAllocated += hoursPerDay;
            }
          });
          
          return {
            ...day,
            available_hours: Math.max(0, day.available_hours - hoursAllocated),
            allocated_hours: hoursAllocated,
            allocations: memberAllocations.filter(alloc => {
              const allocStart = new Date(alloc.start_date);
              const allocEnd = new Date(alloc.end_date);
              return dayDate >= allocStart && dayDate <= allocEnd;
            })
          };
        });
        
        return {
          ...member,
          available_dates: updatedDates
        };
      });
      
      setTeamAvailability(processedAvailability);
    } catch (error) {
      console.error("Erro ao carregar disponibilidade:", error);
      toast.error("Erro ao carregar disponibilidade da equipe");
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  useEffect(() => {
    if (activeTab === "team" && date) {
      loadTeamAvailability();
    }
  }, [date, activeTab]);

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
      <div className="space-y-8">
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
                  
                  let bgColor = "bg-red-100";
                  if (d.available_hours >= 8) {
                    bgColor = "bg-green-100";
                  } else if (d.available_hours >= 4) {
                    bgColor = "bg-yellow-100";
                  } else if (d.available_hours > 0) {
                    bgColor = "bg-orange-100";
                  }
                  
                  const allocationsInfo = d.allocations && d.allocations.length > 0
                    ? d.allocations.map(a => `\n- ${a.projects.name}: ${(a.allocated_hours / (Math.round((new Date(a.end_date).getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24)) || 1)).toFixed(1)}h`).join('')
                    : '\nSem alocações';
                  
                  const tooltipTitle = `${d.available_hours.toFixed(1)} horas disponíveis\n${d.allocated_hours.toFixed(1)} horas alocadas${allocationsInfo}`;
                  
                  return (
                    <div 
                      key={d.date} 
                      className={`${bgColor} p-2 text-center rounded-sm hover:shadow-md cursor-help transition-shadow`}
                      title={tooltipTitle}
                    >
                      <span className="text-xs font-medium">{day}</span>
                      <div className="flex flex-col text-[10px] mt-1">
                        <span>{d.available_hours.toFixed(1)}h disponível</span>
                        {d.allocated_hours > 0 && 
                          <span className="text-red-700">{d.allocated_hours.toFixed(1)}h alocado</span>
                        }
                      </div>
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
          
          <div className="mt-4 p-3 border rounded-md">
            <h3 className="font-medium mb-2">Legenda - Disponibilidade</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 mr-2 rounded"></div>
                <span>≥ 8h disponíveis</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 mr-2 rounded"></div>
                <span>4-8h disponíveis</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-100 mr-2 rounded"></div>
                <span>0-4h disponíveis</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 mr-2 rounded"></div>
                <span>0h disponíveis</span>
              </div>
            </div>
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
