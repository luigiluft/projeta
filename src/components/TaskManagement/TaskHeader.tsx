import { Button } from "@/components/ui/button";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { Column, View } from "@/types/project";

interface TaskHeaderProps {
  columns: Column[];
  savedViews: View[];
  onColumnVisibilityChange: (columnId: string) => void;
  onSaveView: () => void;
  onLoadView: (view: View) => void;
  onImportSpreadsheet: () => void;
  onNewTask: () => void;
  tasks: any[];
}

export function TaskHeader({
  columns,
  savedViews,
  onColumnVisibilityChange,
  onSaveView,
  onLoadView,
  onImportSpreadsheet,
  onNewTask,
  tasks
}: TaskHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
      <ActionButtons
        columns={columns}
        savedViews={savedViews}
        onColumnVisibilityChange={onColumnVisibilityChange}
        onSaveView={onSaveView}
        onLoadView={onLoadView}
        onImportSpreadsheet={onImportSpreadsheet}
        newButtonText="Nova Tarefa"
        onNewClick={onNewTask}
        data={tasks}
        exportFilename="tarefas"
      />
    </div>
  );
}