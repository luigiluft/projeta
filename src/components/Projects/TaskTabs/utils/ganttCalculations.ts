import { Task } from "@/types/project";
import { format, parseISO, isValid, addDays, differenceInDays, addBusinessDays, setHours, setMinutes, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função para calcular datas estimadas para tarefas do novo projeto
export const calculateEstimatedDates = (tasks: Task[], roleHoursPerDay: Record<string, number>) => {
  if (tasks.length === 0) return [];
  
  console.log("Calculando datas estimadas para", tasks.length, "tarefas");
  
  // Estrutura para armazenar a última data de disponibilidade para cada responsável
  const ownerAvailability: Record<string, Date> = {};
  
  // Estrutura para armazenar a data de término de cada tarefa (para dependências)
  const taskEndDates: Record<string, Date> = {};
  
  // Começar com a data atual 
  const today = new Date();
  const defaultStartDate = setHours(setMinutes(today, 0), 9); // 9h da manhã
  
  // Ordenar tarefas por dependências e ordem
  const orderedTasks = [...tasks].sort((a, b) => {
    // Primeiro por dependência
    if (a.depends_on && a.depends_on === b.id) return 1;
    if (b.depends_on && b.depends_on === a.id) return -1;
    
    // Depois por ordem
    const orderA = a.order_number || 0;
    const orderB = b.order_number || 0;
    return orderA - orderB;
  });
  
  console.log("Tarefas ordenadas:", orderedTasks.map(t => t.task_name));
  
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
    
    // Obter a capacidade diária com base no cargo do responsável
    const dailyCapacity = task.owner && roleHoursPerDay[task.owner] 
      ? roleHoursPerDay[task.owner] 
      : roleHoursPerDay.default;
    
    // Estimar duração em dias úteis
    const durationInDays = Math.max(1, Math.ceil(taskHours / dailyCapacity));
    
    // Calcular data de término
    let endDate = startDate;
    if (durationInDays > 0) {
      endDate = addBusinessDays(startDate, durationInDays - 1);
      endDate = setHours(setMinutes(endDate, 0), 17); // Terminar às 17h
    }
    
    console.log(`Tarefa "${task.task_name}": início ${format(startDate, "dd/MM/yyyy")}, fim ${format(endDate, "dd/MM/yyyy")}, duração ${durationInDays} dias`);
    
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
export const findMinMaxDates = (tasks: Task[]) => {
  let minDate = new Date();
  let maxDate = new Date();
  
  if (tasks.length === 0) {
    // Se não há tarefas, mostrar um período de 30 dias a partir de hoje
    maxDate = addDays(new Date(), 30);
    return { minDate, maxDate };
  }

  // Inicializar com valores extremos
  let hasValidDates = false;
  
  // Encontrar min e max entre todas as tarefas
  tasks.forEach(task => {
    if (task.start_date) {
      const startDate = new Date(task.start_date);
      if (isValid(startDate)) {
        if (!hasValidDates || startDate < minDate) {
          minDate = startDate;
        }
        hasValidDates = true;
      }
    }

    if (task.end_date) {
      const endDate = new Date(task.end_date);
      if (isValid(endDate)) {
        if (!hasValidDates || endDate > maxDate) {
          maxDate = endDate;
        }
        hasValidDates = true;
      }
    }
  });

  // Se não encontrou nenhuma data válida, usar hoje como mínimo e máximo
  if (!hasValidDates) {
    minDate = new Date();
    maxDate = addDays(new Date(), 30); // Mostrar um período de 30 dias
  } else {
    // Adicionar um dia de buffer no início e no fim para melhor visualização
    minDate = addDays(minDate, -1);
    maxDate = addDays(maxDate, 1);
  }
  
  console.log("Datas do gráfico:", { min: format(minDate, "dd/MM/yyyy"), max: format(maxDate, "dd/MM/yyyy") });

  return { minDate, maxDate };
};

// Função para verificar se todas as tarefas têm datas válidas
export const allTasksHaveDates = (tasks: Task[]): boolean => {
  if (tasks.length === 0) return false;
  
  return tasks.every(task => {
    const hasStartDate = task.start_date && isValid(new Date(task.start_date));
    const hasEndDate = task.end_date && isValid(new Date(task.end_date));
    return hasStartDate && hasEndDate;
  });
};

// Função para preparar dados para o gráfico de tarefas
export const prepareTaskChartData = (tasks: Task[]) => {
  console.log("Preparando dados para o gráfico com", tasks.length, "tarefas");
  
  return tasks.map(task => {
    // Garantir que temos datas válidas
    const startDate = task.start_date ? new Date(task.start_date) : new Date();
    const endDate = task.end_date ? new Date(task.end_date) : addBusinessDays(new Date(startDate), 1);
    
    // Calcular a duração real em dias
    const durationDays = differenceInDays(endDate, startDate) + 1;
    
    // Obter as horas planejadas da tarefa
    const taskHours = task.calculated_hours || task.fixed_hours || 0;
    
    const chartItem = {
      id: task.id,
      name: task.task_name,
      owner: task.owner,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      value: [startDate.getTime(), endDate.getTime()], // Array com início e fim para o gráfico
      displayStartDate: format(startDate, "dd/MM/yyyy", { locale: ptBR }),
      displayEndDate: format(endDate, "dd/MM/yyyy", { locale: ptBR }),
      displayDuration: `${durationDays} dias (${taskHours.toFixed(1)}h)`, // Mostrar duração em dias e horas
      durationDays: durationDays, // Duração em dias
      isEstimated: task.isEstimated // Flag para indicar se é uma estimativa
    };
    
    console.log(`Item do gráfico: ${chartItem.name}, início ${chartItem.displayStartDate}, fim ${chartItem.displayEndDate}, duração ${chartItem.durationDays} dias`);
    
    return chartItem;
  });
};

// Criar um array com todas as datas entre o início e o final
export const createDateRange = (minDate: Date, maxDate: Date) => {
  const dateRange: Date[] = [];
  let currentDate = new Date(minDate);
  
  // Limitar a quantidade máxima de datas para evitar problemas de performance
  const maxDays = 90;
  let dayCount = 0;
  
  while (currentDate <= maxDate && dayCount < maxDays) {
    dateRange.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
    dayCount++;
  }
  
  return dateRange;
};

// Formatar o conjunto de dados para o eixo X
export const formatXAxisTicks = (dateRange: Date[]) => {
  // Se tivermos muitas datas, mostrar apenas algumas
  if (dateRange.length > 30) {
    // Mostrar aproximadamente uma data a cada 3-7 dias (dependendo do intervalo total)
    const interval = Math.max(3, Math.min(7, Math.floor(dateRange.length / 10)));
    return dateRange
      .filter((_, index) => index % interval === 0)
      .map(date => date.getTime());
  }
  
  return dateRange.map(date => date.getTime());
};

// Adicionando a função calculateGanttData para exportação
export const calculateGanttData = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) {
    return [];
  }
  
  // Filtrar tarefas para aquelas que têm datas definidas
  const tasksWithDates = tasks.filter(task => 
    task.start_date && task.end_date
  );
  
  if (tasksWithDates.length === 0) {
    return [];
  }
  
  return tasksWithDates.map(task => {
    const startDate = new Date(task.start_date || '');
    const endDate = new Date(task.end_date || '');
    
    return {
      id: task.id,
      name: task.task_name,
      owner: task.owner,
      start: startDate.getTime(),
      end: endDate.getTime(),
      duration: [startDate.getTime(), endDate.getTime()],
      status: task.status,
      progress: task.status === 'completed' ? 100 : 
               task.status === 'in_progress' ? 50 : 0
    };
  });
};
