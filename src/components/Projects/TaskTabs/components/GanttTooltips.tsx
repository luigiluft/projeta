
import React from "react";

interface TooltipData {
  name: string;
  owner?: string;
  member?: string;
  displayStartDate: string;
  displayEndDate: string;
  durationDays: number;
  displayDuration: number;
  status?: string;
  isEstimated?: boolean;
}

interface TooltipProps {
  active: boolean;
  payload: any[];
}

export const TaskTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TooltipData;
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

export const AllocationTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TooltipData;
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
