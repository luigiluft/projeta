
import { Task } from "@/types/project";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  calculateEstimatedDates,
  filterImplementationTasks,
  findMinMaxDates,
  prepareTaskChartData,
  createDateRange,
  formatXAxisTicks
} from "./utils/ganttCalculations";
import { TasksChart } from "./components/TasksChart";
import { GanttPreviewAlert } from "./components/GanttPreviewAlert";

// Horas fixas por cargo de responsável
const ROLE_HOURS_PER_DAY = {
  "BK": 6,
  "DS": 7,
  "PMO": 5,
  "PO": 6,
  "CS": 7,
  "FRJ": 7,
  "FRP": 6,
  "BKT": 5,
  "ATS": 6,
  // Valor padrão para cargos não definidos
  "default": 6
};

interface GanttTabProps {
  tasks: Task[];
}

export function GanttTab({ tasks }: GanttTabProps) {
  const location = useLocation();
  
  // Verificar se estamos na página de novo projeto
  const isNewProject = location.pathname === "/projects/new";

  // Filtrar tarefas que são apenas de implementação
  const implementationTasks = filterImplementationTasks(tasks);

  // Preparar tarefas para o gráfico, considerando se é um novo projeto ou não
  let tasksForChart = implementationTasks;
  
  // Para novos projetos, calcular datas estimadas usando as horas fixas por cargo
  if (isNewProject && implementationTasks.length > 0) {
    tasksForChart = calculateEstimatedDates(implementationTasks, ROLE_HOURS_PER_DAY);
  }

  // Organizar tarefas por data de início
  const sortedTasks = [...tasksForChart].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
    return dateA - dateB;
  });

  // Encontrar data mais antiga e mais recente para definir o domínio do gráfico
  const { minDate, maxDate } = findMinMaxDates(sortedTasks);

  // Preparar dados para o gráfico de tarefas
  const taskChartData = prepareTaskChartData(sortedTasks);

  // Criar um array com todas as datas entre o início do projeto e o final
  const dateRange = createDateRange(minDate, maxDate);

  // Formatar o conjunto de dados para o eixo X
  const xAxisTicks = formatXAxisTicks(dateRange);

  // Calcular a altura necessária baseada no número de tarefas
  const taskChartHeight = Math.max(500, taskChartData.length * 40);

  return (
    <div className="space-y-4 mt-4">
      {/* Agora exibimos o alerta com base na página */}
      <GanttPreviewAlert isNewProject={isNewProject} show={isNewProject} />
      
      <h3 className="text-lg font-medium mb-4">Cronograma de Tarefas</h3>
      
      <TasksChart 
        taskChartData={taskChartData}
        taskChartHeight={taskChartHeight}
        xAxisTicks={xAxisTicks}
        minDate={minDate}
        maxDate={maxDate}
        isNewProject={isNewProject}
      />
    </div>
  );
}
