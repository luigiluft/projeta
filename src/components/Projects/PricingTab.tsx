
import { useEffect, useState } from "react";
import { Task, Column } from "@/types/project";
import { calculateCosts, processTasks } from "./utils/taskCalculations";
import { formatCurrency } from "@/utils/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";

interface PricingTabProps {
  tasks: Task[];
  attributeValues: Record<string, number>;
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export function PricingTab({ tasks, attributeValues, columns, onColumnsChange }: PricingTabProps) {
  const [calculatedTasks, setCalculatedTasks] = useState<Task[]>([]);
  const [costsByPhase, setCostsByPhase] = useState<any[]>([]);
  const [costsByEpic, setCostsByEpic] = useState<any[]>([]);
  const [totalCosts, setTotalCosts] = useState<{ totalHours: number; totalCost: number; averageHourlyRate: number }>({
    totalHours: 0,
    totalCost: 0,
    averageHourlyRate: 0
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      console.log("PricingTab: Nenhuma tarefa para processar");
      return;
    }

    console.log(`PricingTab: Processando ${tasks.length} tarefas com atributos:`, attributeValues);
    
    // Processar tarefas com os atributos numéricos
    const processedTasks = processTasks(tasks, attributeValues);
    setCalculatedTasks(processedTasks);
    
    // Calcular custos totais
    const costs = calculateCosts(processedTasks);
    setTotalCosts(costs);
    
    // Agrupar custos por fase
    const phaseGroups = processedTasks.reduce((groups: Record<string, { hours: number, cost: number }>, task) => {
      const phase = task.phase || 'Sem fase';
      if (!groups[phase]) {
        groups[phase] = { hours: 0, cost: 0 };
      }
      
      const hours = task.calculated_hours || task.fixed_hours || 0;
      const hourlyRate = 150; // Taxa horária padrão
      const cost = hours * hourlyRate;
      
      groups[phase].hours += hours;
      groups[phase].cost += cost;
      
      return groups;
    }, {});
    
    const phaseData = Object.entries(phaseGroups).map(([name, data]) => ({
      name,
      value: data.cost,
      hours: data.hours
    }));
    
    setCostsByPhase(phaseData);
    
    // Agrupar custos por epic
    const epicGroups = processedTasks.reduce((groups: Record<string, { hours: number, cost: number }>, task) => {
      const epic = task.epic || 'Sem epic';
      if (!groups[epic]) {
        groups[epic] = { hours: 0, cost: 0 };
      }
      
      const hours = task.calculated_hours || task.fixed_hours || 0;
      const hourlyRate = 150; // Taxa horária padrão
      const cost = hours * hourlyRate;
      
      groups[epic].hours += hours;
      groups[epic].cost += cost;
      
      return groups;
    }, {});
    
    const epicData = Object.entries(epicGroups).map(([name, data]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      fullName: name,
      value: data.cost,
      hours: data.hours
    }));
    
    setCostsByEpic(epicData);
    
    console.log("PricingTab: Dados de custos calculados:", { 
      total: costs, 
      byPhase: phaseData.length, 
      byEpic: epicData.length 
    });
    
  }, [tasks, attributeValues]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-medium">{data.fullName || data.name}</p>
          <p className="text-sm">Custo: {formatCurrency(data.value)}</p>
          <p className="text-sm">Horas: {data.hours.toFixed(2)}h</p>
          <p className="text-sm text-gray-500">{((data.value / totalCosts.totalCost) * 100).toFixed(2)}% do total</p>
        </div>
      );
    }
    return null;
  };

  // Restante do componente permanece igual

  return (
    <div className="space-y-8 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-medium mb-2">Custo Total</h3>
          <p className="text-3xl font-bold text-primary">{formatCurrency(totalCosts.totalCost)}</p>
          <div className="mt-2 text-sm text-gray-600">
            <p>Total de Horas: {totalCosts.totalHours.toFixed(2)}h</p>
            <p>Média HH: {formatCurrency(totalCosts.averageHourlyRate)}/h</p>
          </div>
        </div>
        
        {/* Outros cards de estatísticas aqui */}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de pizza por fase */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-medium mb-4">Distribuição de Custos por Fase</h3>
          {costsByPhase.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costsByPhase}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={false}
                >
                  {costsByPhase.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500">Não há dados suficientes para exibir o gráfico</p>
            </div>
          )}
        </div>
        
        {/* Gráfico de barras por epic */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-medium mb-4">Distribuição de Custos por Epic</h3>
          {costsByEpic.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={costsByEpic}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Custo">
                  {costsByEpic.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500">Não há dados suficientes para exibir o gráfico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
