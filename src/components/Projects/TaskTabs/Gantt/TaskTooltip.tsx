
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskTooltipProps {
  active?: boolean;
  payload?: any[];
}

export function TaskTooltip({ active, payload }: TaskTooltipProps) {
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
}
