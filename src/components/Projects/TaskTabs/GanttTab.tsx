
import { Task } from "@/types/project";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GanttTabProps {
  tasks: Task[];
}

export function GanttTab({ tasks }: GanttTabProps) {
  // Filtrar tarefas de implementação excluindo específicamente todas as que são de sustentação ou integração
  const implementationTasks = tasks.filter(task => 
    // Implementações
    (task.epic.toLowerCase().startsWith('implementação') ||
    task.epic.toLowerCase().startsWith('implementacao')) &&
    
    // Excluir integrações
    !task.epic.toLowerCase().includes('integração com') &&
    !task.epic.toLowerCase().includes('integracao com') &&
    
    // Excluir terceiros
    !task.is_third_party_cost
  );

  // Organizar tarefas por data de início
  const sortedTasks = [...implementationTasks].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
    return dateA - dateB;
  });

  // Preparar dados para o gráfico
  const chartData = sortedTasks.map(task => {
    const startDate = task.start_date ? new Date(task.start_date).getTime() : 0;
    const endDate = task.end_date ? new Date(task.end_date).getTime() : 0;
    
    return {
      name: task.task_name,
      owner: task.owner,
      start: startDate,
      end: endDate,
      // Certifique-se de exibir a diferença entre start e end, não apenas a duração
      duration: task.calculated_hours || task.fixed_hours || 0,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">Responsável: {data.owner}</p>
          <p className="text-sm">
            Início: {format(data.start, "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </p>
          <p className="text-sm">
            Fim: {format(data.end, "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </p>
          <p className="text-sm">
            Duração: {data.duration} horas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-medium mb-4">Cronograma do Projeto</h3>
      <div className="border rounded-md p-4 bg-white shadow-sm" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            barSize={20}
            margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
          >
            <XAxis
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(unixTime) => format(unixTime, "dd/MM", { locale: ptBR })}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Barra que mostra de início a fim da tarefa */}
            <Bar
              dataKey="start"
              fill="transparent"
              stackId="a"
            />
            <Bar
              dataKey="end"
              fill="#60a5fa"
              minPointSize={2}
              name="Duração"
              stackId="a"
              background={{ fill: '#eee' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
