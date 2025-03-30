
import React from "react";
import { Badge } from "@/components/ui/badge";

interface GanttPreviewAlertProps {
  isNewProject: boolean;
}

export const GanttPreviewAlert: React.FC<GanttPreviewAlertProps> = ({ isNewProject }) => {
  if (!isNewProject) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
          Prévia
        </Badge>
        <p className="text-sm text-amber-800">
          Estimativa de cronograma para o novo projeto. As datas serão ajustadas ao salvar.
        </p>
      </div>
    </div>
  );
};
