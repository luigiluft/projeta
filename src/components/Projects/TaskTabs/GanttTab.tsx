
import { Task } from "@/types/project";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { format, parseISO, isValid, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GanttTabProps {
  tasks: Task[];
}

export function GanttTab({ tasks }: GanttTabProps) {
  // Filtrar tarefas de implementação excluindo específicamente todas as que são de sustentação ou integração
  const implementationTasks = tasks.filter(task => 
    task.epic.toLowerCase().startsWith('implementação') ||
    task.epic.toLowerCase().startsWith('implementacao')
  );

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

  // Preparar dados para o gráfico
  const chartData = sortedTasks.map(task => {
    // Garantir que temos datas válidas
    const startDate = task.start_date ? new Date(task.start_date) : new Date();
    const endDate = task.end_date ? new Date(task.end_date) : new Date(startDate);
    
    // Duração em milissegundos
    const duration = endDate.getTime() - startDate.getTime();
    
    return {
      name: task.task_name,
      owner: task.owner,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      duration: duration,
      displayStartDate: format(startDate, "dd/MM/yyyy", { locale: ptBR }),
      displayEndDate: format(endDate, "dd/MM/yyyy", { locale: ptBR }),
      displayDuration: task.calculated_hours || task.fixed_hours || 0,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium text-sm mb-1">{data.name}</p>
          <p className="text-xs text-gray-600 mb-1">Responsável: {data.owner}</p>
          <p className="text-xs mb-1">
            Início: {data.displayStartDate}
          </p>
          <p className="text-xs mb-1">
            Fim: {data.displayEndDate}
          </p>
          <p className="text-xs">
            Duração: {data.displayDuration} horas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-medium mb-4">Cronograma do Projeto</h3>
      
      {chartData.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md border">
          <p className="text-gray-500">Nenhuma tarefa de implementação encontrada.</p>
        </div>
      ) : (
        <div className="border rounded-md p-4 bg-white shadow-sm" style={{ height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
              barGap={0}
              barCategoryGap={5}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number"
                domain={[minDate.getTime(), maxDate.getTime()]}
                tickFormatter={(timestamp) => format(timestamp, "dd/MM", { locale: ptBR })}
                scale="time"
                dataKey="x"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Barra que mostra a duração entre início e fim da tarefa */}
              <Bar
                dataKey="duration"
                name="Duração"
                minPointSize={3}
                barSize={20}
                fill="#60a5fa"
                radius={[4, 4, 4, 4]}
                stackId="a"
                // Configurando a posição para começar a partir da data de início
                stackedOffset={(entry) => entry.startTime - minDate.getTime()}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
