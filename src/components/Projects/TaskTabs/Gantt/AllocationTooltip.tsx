
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AllocationTooltipProps {
  active?: boolean;
  payload?: any[];
}

export function AllocationTooltip({ active, payload }: AllocationTooltipProps) {
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
          Horas alocadas: {data.displayDuration}
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
}
