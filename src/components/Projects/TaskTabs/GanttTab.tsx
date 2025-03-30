
import { Task } from "@/types/project";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, parseISO, isValid, addDays, differenceInDays, addBusinessDays, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface GanttTabProps {
  tasks: Task[];
}

interface TeamAllocation {
  id: string;
  member_id: string;
  member_name: string;
  project_id: string;
  task_id: string;
  task_name: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: string;
}

export function GanttTab({ tasks }: GanttTabProps) {
  const [allocations, setAllocations] = useState<TeamAllocation[]>([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("tasks");
  const location = useLocation();
  
  // Verificar se estamos na página de novo projeto
  const isNewProject = location.pathname === "/projects/new";

  // Filtrar tarefas que são apenas de implementação
  const implementationTasks = tasks.filter(task => 
    !task.epic.toLowerCase().includes('sustentação') &&
    !task.epic.toLowerCase().includes('sustentacao')
  );

  useEffect(() => {
    // Para projetos novos, não precisamos buscar alocações existentes
    // Mas para projetos existentes, continuamos buscando as alocações
    if (tasks.length > 0 && tasks[0].project_task_id && !isNewProject) {
      // Primeiro, buscar o project_id usando o project_task_id
      const fetchProjectId = async () => {
        const { data: projectTaskData, error: projectTaskError } = await supabase
          .from('project_tasks')
          .select('project_id')
          .eq('id', tasks[0].project_task_id)
          .single();

        if (projectTaskError) {
          console.error("Erro ao buscar project_id:", projectTaskError);
          return;
        }

        if (projectTaskData?.project_id) {
          fetchAllocations(projectTaskData.project_id);
        }
      };

      fetchProjectId();
    } else if (isNewProject) {
      // Para projetos novos, buscamos alocações gerais da equipe
      // para mostrar a disponibilidade atual
      fetchTeamAllocations();
    }
  }, [tasks, isNewProject]);

  const fetchTeamAllocations = async () => {
    try {
      setLoadingAllocations(true);
      
      // Buscar todas as alocações ativas para mostrar disponibilidade
      const { data: allocationData, error: allocationError } = await supabase
        .from('project_allocations')
        .select(`
          id,
          project_id,
          member_id,
          task_id,
          start_date,
          end_date,
          allocated_hours,
          status,
          tasks:task_id(task_name),
          team_members:member_id(first_name, last_name)
        `)
        .in('status', ['scheduled', 'in_progress']);

      if (allocationError) {
        console.error("Erro ao buscar alocações gerais:", allocationError);
        return;
      }

      // Formatar os dados de alocação
      const formattedAllocations = allocationData.map(alloc => ({
        id: alloc.id,
        member_id: alloc.member_id,
        member_name: `${alloc.team_members.first_name} ${alloc.team_members.last_name}`,
        project_id: alloc.project_id,
        task_id: alloc.task_id,
        task_name: alloc.tasks?.task_name || "Sem tarefa",
        start_date: alloc.start_date,
        end_date: alloc.end_date,
        allocated_hours: alloc.allocated_hours,
        status: alloc.status
      }));

      console.log("Alocações gerais encontradas:", formattedAllocations.length);
      setAllocations(formattedAllocations);
    } catch (error) {
      console.error("Erro ao carregar alocações gerais:", error);
    } finally {
      setLoadingAllocations(false);
    }
  };

  const fetchAllocations = async (projectId: string) => {
    try {
      setLoadingAllocations(true);
      
      // Buscar alocações para este projeto
      const { data: allocationData, error: allocationError } = await supabase
        .from('project_allocations')
        .select(`
          id,
          project_id,
          member_id,
          task_id,
          start_date,
          end_date,
          allocated_hours,
          status,
          tasks:task_id(task_name),
          team_members:member_id(first_name, last_name)
        `)
        .eq('project_id', projectId);

      if (allocationError) {
        console.error("Erro ao buscar alocações:", allocationError);
        return;
      }

      // Formatar os dados de alocação
      const formattedAllocations = allocationData.map(alloc => ({
        id: alloc.id,
        member_id: alloc.member_id,
        member_name: `${alloc.team_members.first_name} ${alloc.team_members.last_name}`,
        project_id: alloc.project_id,
        task_id: alloc.task_id,
        task_name: alloc.tasks?.task_name || "Sem tarefa",
        start_date: alloc.start_date,
        end_date: alloc.end_date,
        allocated_hours: alloc.allocated_hours,
        status: alloc.status
      }));

      setAllocations(formattedAllocations);
    } catch (error) {
      console.error("Erro ao carregar alocações:", error);
    } finally {
      setLoadingAllocations(false);
    }
  };

  // Calcular datas estimadas para tarefas do novo projeto
  const calculateEstimatedDates = (tasks: Task[]) => {
    if (tasks.length === 0) return [];
    
    // Estrutura para armazenar a última data de disponibilidade para cada responsável
    const ownerAvailability: Record<string, Date> = {};
    
    // Estrutura para armazenar a data de término de cada tarefa (para dependências)
    const taskEndDates: Record<string, Date> = {};
    
    // Verificar se há alocações existentes que afetam a disponibilidade
    allocations.forEach(allocation => {
      const owner = allocation.member_name.split(' ')[0]; // Simplificação, usar apenas o primeiro nome
      const endDate = new Date(allocation.end_date);
      
      if (!ownerAvailability[owner] || endDate > ownerAvailability[owner]) {
        ownerAvailability[owner] = endDate;
      }
    });
    
    // Começar com a data atual se não houver alocações
    const today = new Date();
    const defaultStartDate = setHours(setMinutes(today, 0), 9); // 9h da manhã
    
    // Ordenar tarefas por dependências e ordem
    const orderedTasks = [...tasks].sort((a, b) => {
      // Primeiro por dependência
      if (a.depends_on && a.depends_on === b.id) return 1;
      if (b.depends_on && b.depends_on === a.id) return -1;
      
      // Depois por ordem
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
    
    // Calcular datas para cada tarefa
    return orderedTasks.map(task => {
      // Determinar data de início inicial
      let startDate = defaultStartDate;
      
      // Considerar disponibilidade do responsável
      if (task.owner && ownerAvailability[task.owner]) {
        const ownerDate = new Date(ownerAvailability[task.owner]);
        // Adicionar um dia útil após a última alocação do responsável
        startDate = addBusinessDays(ownerDate, 1);
        startDate = setHours(setMinutes(startDate, 0), 9); // Começar às 9h
      }
      
      // Considerar dependências
      if (task.depends_on && taskEndDates[task.depends_on]) {
        const dependencyEndDate = new Date(taskEndDates[task.depends_on]);
        // Usar a data que for mais tarde: disponibilidade do responsável ou término da dependência
        if (dependencyEndDate > startDate) {
          startDate = addBusinessDays(dependencyEndDate, 1);
          startDate = setHours(setMinutes(startDate, 0), 9); // Começar às 9h
        }
      }
      
      // Calcular horas da tarefa
      const taskHours = task.calculated_hours || task.fixed_hours || 0;
      
      // Estimar duração em dias úteis (assumindo 8h por dia)
      const durationInDays = Math.ceil(taskHours / 8);
      
      // Calcular data de término
      let endDate = startDate;
      if (durationInDays > 0) {
        endDate = addBusinessDays(startDate, durationInDays - 1);
        endDate = setHours(setMinutes(endDate, 0), 17); // Terminar às 17h
      }
      
      // Atualizar disponibilidade do responsável
      if (task.owner) {
        ownerAvailability[task.owner] = endDate;
      }
      
      // Registrar data de término para dependências
      taskEndDates[task.id] = endDate;
      
      // Criar cópia da tarefa com datas estimadas
      return {
        ...task,
        start_date: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        end_date: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
        // Flag para indicar que é uma estimativa para novo projeto
        isEstimated: true
      };
    });
  };

  // Preparar tarefas para o gráfico, considerando se é um novo projeto ou não
  let tasksForChart = implementationTasks;
  
  // Para novos projetos, calcular datas estimadas
  if (isNewProject && implementationTasks.length > 0) {
    tasksForChart = calculateEstimatedDates(implementationTasks);
  }

  // Organizar tarefas por data de início
  const sortedTasks = [...tasksForChart].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
    return dateA - dateB;
  });

  // Encontrar data mais antiga e mais recente para definir o domínio do gráfico
  let minDate = new Date();
  let maxDate = new Date();

  if (sortedTasks.length > 0) {
    // Inicializar com a primeira tarefa
    const firstTaskStart = sortedTasks[0].start_date 
      ? new Date(sortedTasks[0].start_date) 
      : new Date();
    
    minDate = firstTaskStart;
    maxDate = firstTaskStart;

    // Encontrar min e max entre todas as tarefas
    sortedTasks.forEach(task => {
      if (task.start_date) {
        const startDate = new Date(task.start_date);
        if (isValid(startDate) && startDate < minDate) {
          minDate = startDate;
        }
      }

      if (task.end_date) {
        const endDate = new Date(task.end_date);
        if (isValid(endDate) && endDate > maxDate) {
          maxDate = endDate;
        }
      }
    });

    // Adicionar um dia de buffer no início e no fim para melhor visualização
    minDate = addDays(minDate, -1);
    maxDate = addDays(maxDate, 1);
  }

  // Se temos alocações, considerar suas datas também para o domínio do gráfico
  if (allocations.length > 0) {
    allocations.forEach(allocation => {
      const allocStart = new Date(allocation.start_date);
      const allocEnd = new Date(allocation.end_date);
      
      if (isValid(allocStart) && allocStart < minDate) {
        minDate = allocStart;
      }
      
      if (isValid(allocEnd) && allocEnd > maxDate) {
        maxDate = allocEnd;
      }
    });
  }

  // Preparar dados para o gráfico de tarefas
  const taskChartData = sortedTasks.map(task => {
    // Garantir que temos datas válidas
    const startDate = task.start_date ? new Date(task.start_date) : new Date();
    const endDate = task.end_date ? new Date(task.end_date) : new Date(startDate);
    
    // Calcular a duração real em dias
    const durationDays = differenceInDays(endDate, startDate) + 1;
    
    // Obter as horas planejadas da tarefa
    const taskHours = task.calculated_hours || task.fixed_hours || 0;
    
    return {
      name: task.task_name,
      owner: task.owner,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      value: [startDate.getTime(), endDate.getTime()], // Array com início e fim
      displayStartDate: format(startDate, "dd/MM/yyyy", { locale: ptBR }),
      displayEndDate: format(endDate, "dd/MM/yyyy", { locale: ptBR }),
      displayDuration: taskHours, // Usar as horas da tarefa
      durationDays: durationDays, // Duração em dias
      isEstimated: task.isEstimated // Flag para indicar se é uma estimativa
    };
  });

  // Preparar dados para o gráfico de alocações
  const allocationChartData = allocations.map(allocation => {
    const startDate = new Date(allocation.start_date);
    const endDate = new Date(allocation.end_date);
    
    // Calcular a duração em dias
    const durationDays = differenceInDays(endDate, startDate) + 1;
    
    return {
      name: allocation.task_name,
      member: allocation.member_name,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      value: [startDate.getTime(), endDate.getTime()],
      displayStartDate: format(startDate, "dd/MM/yyyy", { locale: ptBR }),
      displayEndDate: format(endDate, "dd/MM/yyyy", { locale: ptBR }),
      displayDuration: allocation.allocated_hours,
      durationDays: durationDays,
      status: allocation.status
    };
  });

  // Criar um array com todas as datas entre o início do projeto e o final
  const dateRange: Date[] = [];
  if (minDate && maxDate) {
    let currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      dateRange.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
  }

  // Formatar o conjunto de dados para o eixo X
  const xAxisTicks = dateRange.map(date => date.getTime());

  // Componente personalizado para o tooltip das tarefas
  const TaskTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium text-sm mb-1">{data.name}</p>
          <p className="text-xs text-gray-600 mb-1">Responsável: {data.owner || "Não atribuído"}</p>
          <p className="text-xs mb-1">
            Início: {data.displayStartDate}
          </p>
          <p className="text-xs mb-1">
            Fim: {data.displayEndDate}
          </p>
          <p className="text-xs mb-1">
            Duração: {data.durationDays} {data.durationDays === 1 ? 'dia' : 'dias'}
          </p>
          <p className="text-xs font-semibold">
            Horas calculadas: {data.displayDuration} horas
          </p>
          {data.isEstimated && (
            <p className="text-xs text-amber-600 mt-1 font-semibold">
              * Estimativa para novo projeto
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Componente personalizado para o tooltip das alocações
  const AllocationTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium text-sm mb-1">{data.name}</p>
          <p className="text-xs text-gray-600 mb-1">Alocado para: {data.member}</p>
          <p className="text-xs mb-1">
            Início: {data.displayStartDate}
          </p>
          <p className="text-xs mb-1">
            Fim: {data.displayEndDate}
          </p>
          <p className="text-xs mb-1">
            Duração: {data.durationDays} {data.durationDays === 1 ? 'dia' : 'dias'}
          </p>
          <p className="text-xs font-semibold">
            Horas alocadas: {data.displayDuration} horas
          </p>
          <p className="text-xs">
            Status: {data.status === 'scheduled' ? 'Agendada' : 
                   data.status === 'in_progress' ? 'Em Andamento' : 
                   data.status === 'completed' ? 'Concluída' : data.status}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcular a altura necessária baseada no número de tarefas ou alocações
  const taskChartHeight = Math.max(500, taskChartData.length * 40);
  const allocationChartHeight = Math.max(500, allocationChartData.length * 40);

  return (
    <div className="space-y-4 mt-4">
      {isNewProject && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
              Prévia
            </Badge>
            <p className="text-sm text-amber-800">
              Estimativa de cronograma para o novo projeto. As datas serão ajustadas ao salvar.
            </p>
          </div>
        </div>
      )}
      
      <Tabs 
        defaultValue="tasks" 
        className="w-full" 
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 w-64 mb-4">
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="allocations">Alocações</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <h3 className="text-lg font-medium mb-4">Cronograma de Tarefas</h3>
          
          {taskChartData.length === 0 ? (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md border">
              <p className="text-gray-500">Nenhuma tarefa de implementação encontrada.</p>
            </div>
          ) : (
            <ScrollArea className="border rounded-md p-4 bg-white shadow-sm h-[500px]">
              <div style={{ height: `${taskChartHeight}px`, minWidth: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskChartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                    barGap={0}
                    barCategoryGap={5}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis 
                      type="number"
                      domain={[minDate.getTime(), maxDate.getTime()]}
                      tickFormatter={(timestamp) => format(new Date(timestamp), "dd/MM", { locale: ptBR })}
                      scale="time"
                      ticks={xAxisTicks}
                      allowDataOverflow={true}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<TaskTooltip />} />
                    <Legend />
                    
                    {/* Barra representando a duração entre início e fim da tarefa */}
                    <Bar
                      dataKey="value"
                      name="Duração"
                      minPointSize={3}
                      barSize={20}
                      fill={isNewProject ? "#f59e0b" : "#60a5fa"} // Cor diferente para projetos novos
                      radius={[4, 4, 4, 4]}
                      background={{ fill: "#eee" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="allocations">
          <h3 className="text-lg font-medium mb-4">Alocações de Equipe</h3>
          
          {loadingAllocations ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : allocationChartData.length === 0 ? (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md border">
              <p className="text-gray-500">
                {isNewProject 
                  ? "Sem alocações existentes para exibir como referência." 
                  : "Não há alocações de recursos para este projeto."}
              </p>
            </div>
          ) : (
            <ScrollArea className="border rounded-md p-4 bg-white shadow-sm h-[500px]">
              <div style={{ height: `${allocationChartHeight}px`, minWidth: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allocationChartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                    barGap={0}
                    barCategoryGap={5}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis 
                      type="number"
                      domain={[minDate.getTime(), maxDate.getTime()]}
                      tickFormatter={(timestamp) => format(new Date(timestamp), "dd/MM", { locale: ptBR })}
                      scale="time"
                      ticks={xAxisTicks}
                      allowDataOverflow={true}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<AllocationTooltip />} />
                    <Legend />
                    
                    {/* Barra representando a duração entre início e fim da alocação */}
                    <Bar
                      dataKey="value"
                      name="Alocação"
                      minPointSize={3}
                      barSize={20}
                      fill="#10b981"
                      radius={[4, 4, 4, 4]}
                      background={{ fill: "#eee" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
