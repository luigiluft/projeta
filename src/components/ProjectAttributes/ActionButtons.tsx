import { Button } from "@/components/ui/button";
import { Plus, FilePlus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnManager } from "./ColumnManager";
import { ViewManager } from "./ViewManager";
import { exportToCSV } from "@/utils/csvExport";

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface View {
  id: string;
  name: string;
  columns: string[];
}

interface ActionButtonsProps {
  columns: Column[];
  savedViews: View[];
  onColumnVisibilityChange: (columnId: string) => void;
  onSaveView: () => void;
  onLoadView: (view: View) => void;
  onImportSpreadsheet: () => void;
  newButtonText?: string;
  data?: any[];
  exportFilename?: string;
}

export function ActionButtons({
  columns,
  savedViews,
  onColumnVisibilityChange,
  onSaveView,
  onLoadView,
  onImportSpreadsheet,
  newButtonText = "Adicionar Atributo",
  data = [],
  exportFilename = "export",
}: ActionButtonsProps) {
  const navigate = useNavigate();

  const handleExport = () => {
    if (data.length === 0) return;
    exportToCSV(data, exportFilename);
  };

  const getActionText = (buttonText: string) => {
    switch (buttonText) {
      case "Adicionar Projeto":
        return "Cadastrar Projeto";
      case "Novo Membro":
        return "Cadastrar Membro";
      case "Nova Tarefa":
        return "Cadastrar Tarefa";
      default:
        return "Cadastrar Atributo";
    }
  };

  const getNavigationPath = () => {
    switch (newButtonText) {
      case "Adicionar Projeto":
        return "/projects/new";
      case "Novo Membro":
        return "/team/new";
      case "Nova Tarefa":
        return "/task-management/new";
      default:
        return "/project-attributes/new";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <ColumnManager
        columns={columns}
        onColumnVisibilityChange={onColumnVisibilityChange}
      />
      <ViewManager
        onSaveView={onSaveView}
        onLoadView={onLoadView}
        savedViews={savedViews}
      />
      <Button variant="outline" onClick={handleExport} disabled={data.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {newButtonText}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-lg">
          <DropdownMenuItem onClick={() => navigate(getNavigationPath())}>
            <Plus className="mr-2 h-4 w-4" />
            {getActionText(newButtonText)}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onImportSpreadsheet}>
            <FilePlus className="mr-2 h-4 w-4" />
            Importar Planilha
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}