
import { Task, TeamAllocation } from "@/types/project";
import { format, parseISO, isValid, addDays, differenceInDays, addBusinessDays, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função para calcular datas estimadas para tarefas do novo projeto
export const calculateEstimatedDates = (tasks: Task[], allocations: TeamAllocation[] = []) => {
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

// Função para filtrar tarefas de implementação
export const filterImplementationTasks = (tasks: Task[]) => {
  return tasks.filter(task => 
    !task.epic.toLowerCase().includes('sustentação') &&
    !task.epic.toLowerCase().includes('sustentacao')
  );
};

// Função para encontrar datas mínimas e máximas para o gráfico
export const findMinMaxDates = (tasks: Task[], allocations: TeamAllocation[] = []) => {
  let minDate = new Date();
  let maxDate = new Date();

  if (tasks.length > 0) {
    // Inicializar com a primeira tarefa
    const firstTaskStart = tasks[0].start_date 
      ? new Date(tasks[0].start_date) 
      : new Date();
    
    minDate = firstTaskStart;
    maxDate = firstTaskStart;

    // Encontrar min e max entre todas as tarefas
    tasks.forEach(task => {
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

  return { minDate, maxDate };
};

// Função para preparar dados para o gráfico de tarefas
export const prepareTaskChartData = (tasks: Task[]) => {
  return tasks.map(task => {
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
};

// Função para preparar dados para o gráfico de alocações
export const prepareAllocationChartData = (allocations: TeamAllocation[]) => {
  return allocations.map(allocation => {
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
};

// Criar um array com todas as datas entre o início e o final
export const createDateRange = (minDate: Date, maxDate: Date) => {
  const dateRange: Date[] = [];
  let currentDate = new Date(minDate);
  
  while (currentDate <= maxDate) {
    dateRange.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dateRange;
};

// Formatar o conjunto de dados para o eixo X
export const formatXAxisTicks = (dateRange: Date[]) => {
  return dateRange.map(date => date.getTime());
};
