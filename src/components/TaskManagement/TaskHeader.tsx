
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ColumnManager } from "./ColumnManager";
import { ViewManager } from "./ViewManager";
import { Column, Task, View } from "@/types/project";
import { 
  DownloadIcon, 
  PlusIcon, 
  TableIcon,
  UploadIcon,
  FileSpreadsheetIcon
} from "lucide-react";
import { exportToCSV } from "@/utils/csvExport";
import { Link } from "react-router-dom";

interface TaskHeaderProps {
  columns: Column[];
  savedViews: View[];
  onColumnVisibilityChange: (columnId: string) => void;
  onSaveView: () => void;
  onLoadView: (view: View) => void;
  onImportSpreadsheet: () => void;
  onNewTask: () => void;
  tasks: Task[];
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
  const handleExportCSV = () => {
    const visibleColumns = columns.filter(col => col.visible);
    
    const exportData = tasks.map(task => {
      const row: Record<string, any> = {};
      
      visibleColumns.forEach(col => {
        const colId = col.id;
        if (colId in task) {
          row[col.label] = (task as any)[colId];
        }
      });
      
      return row;
    });

    exportToCSV(exportData, "tarefas");
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold">Gerenciamento de Tarefas</h2>
      
      <div className="flex items-center gap-2">
        <ColumnManager 
          columns={columns}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
        
        <ViewManager 
          views={savedViews}
          onSaveView={onSaveView}
          onLoadView={onLoadView}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <TableIcon className="h-4 w-4 mr-2" />
              Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Exportar para CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImportSpreadsheet}>
              <UploadIcon className="h-4 w-4 mr-2" />
              Importar Planilha
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/task-management/bulk-import">
                <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                Importação em Lote
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button size="sm" onClick={onNewTask}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>
    </div>
  );
}
