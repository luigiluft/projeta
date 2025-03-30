
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
import { format, parseISO, isValid, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Filtrar tarefas que são apenas de implementação
  const implementationTasks = tasks.filter(task => 
    !task.epic.toLowerCase().includes('sustentação') &&
    !task.epic.toLowerCase().includes('sustentacao')
  );

  useEffect(() => {
    if (tasks.length > 0 && tasks[0].project_task_id) {
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
    }
  }, [tasks]);

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

  // Organizar tarefas por data de início
  const sortedTasks = [...implementationTasks].sort((a, b) => {
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
      durationDays: durationDays // Duração em dias
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
            Horas planejadas: {data.displayDuration} horas
          </p>
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
                      fill="#60a5fa"
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
                Não há alocações de recursos para este projeto.
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
