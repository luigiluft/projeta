
import { Task } from "@/types/project";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
}

export const TaskTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white p-3 rounded shadow-md border border-gray-200 max-w-xs">
      <h6 className="font-semibold text-gray-900 mb-1">{data.name}</h6>
      
      {data.owner && (
        <div className="text-sm mb-1">
          <span className="text-gray-600 font-medium">Responsável:</span> {data.owner}
        </div>
      )}
      
      <div className="text-sm mb-1">
        <span className="text-gray-600 font-medium">Início:</span> {data.displayStartDate}
      </div>
      
      <div className="text-sm mb-1">
        <span className="text-gray-600 font-medium">Término:</span> {data.displayEndDate}
      </div>
      
      <div className="text-sm mb-1">
        <span className="text-gray-600 font-medium">Duração:</span> {data.durationDays} {data.durationDays === 1 ? 'dia' : 'dias'}
      </div>
      
      <div className="text-sm">
        <span className="text-gray-600 font-medium">Horas:</span> {data.displayDuration}
      </div>
      
      {data.isEstimated && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Estimativa baseada na capacidade da equipe
        </div>
      )}
    </div>
  );
};
