
import React from 'react';
import { TooltipProps } from 'recharts';

interface GanttTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const GanttTooltip: React.FC<GanttTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
      <p className="font-medium">{data.name}</p>
      <p className="text-gray-600">Início: {data.displayStartDate}</p>
      <p className="text-gray-600">Fim: {data.displayEndDate}</p>
      <p className="text-gray-600">Duração: {data.displayDuration}</p>
      {data.isEstimated && (
        <p className="text-amber-600 font-medium mt-1">Estimativa prévia</p>
      )}
    </div>
  );
};

export const TaskTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
      <p className="font-medium">{data.name}</p>
      <p className="text-gray-600">Início: {data.displayStartDate}</p>
      <p className="text-gray-600">Fim: {data.displayEndDate}</p>
      <p className="text-gray-600">Duração: {data.durationDays} dias</p>
      {data.owner && <p className="text-gray-600">Responsável: {data.owner}</p>}
    </div>
  );
};

export const AllocationTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
      <p className="font-medium">{data.name}</p>
      <p className="text-gray-600">Período: {data.displayDateRange}</p>
      <p className="text-gray-600">Horas alocadas: {data.hours}h</p>
      {data.projects && <p className="text-gray-600">Projetos: {data.projects}</p>}
    </div>
  );
};
