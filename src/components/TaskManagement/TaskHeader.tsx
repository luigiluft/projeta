
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { toast } from "sonner";
import { Filter, Eye, Download, Plus, FilePlus } from "lucide-react";
import { Column } from '@/types/project';
import { ColumnManager } from '@/components/ProjectAttributes/ColumnManager';
import { TaskImporter } from '@/components/TaskManagement/TaskImporter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskHeaderProps {
  columns: Column[];
  onColumnVisibilityChange: (columnId: string) => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ 
  columns,
  onColumnVisibilityChange
}) => {
  const navigate = useNavigate();
  const { exportTasks, refreshTasks } = useTaskManagement();

  const handleExportCSV = () => {
    try {
      console.log('Export CSV button clicked');
      exportTasks();
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar CSV');
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold">Gestão de Tarefas</h3>
      
      <div className="flex items-center space-x-2">
        <ColumnManager 
          columns={columns}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Visualização
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={handleExportCSV}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              className="flex items-center gap-2 bg-primary text-white"
            >
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/task-management/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Tarefa
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TaskImporter onSuccess={refreshTasks} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
