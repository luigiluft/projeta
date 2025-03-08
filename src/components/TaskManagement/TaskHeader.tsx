
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useToast } from '@/hooks/use-toast';
import { Filter, Eye, Download, Plus, Trash2 } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskHeaderProps {
  selectedTasks: string[];
  onDeleteTasks: (taskIds: string[]) => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ selectedTasks, onDeleteTasks }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteTasks, columns, handleColumnVisibilityChange } = useTaskManagement();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTasks(selectedTasks);
      onDeleteTasks(selectedTasks);
      toast({
        title: "Tarefas excluídas com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir tarefas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteConfirmation = () => {
    if (selectedTasks.length === 0) {
      toast({
        title: "Nenhuma tarefa selecionada",
        description: "Selecione as tarefas que deseja excluir.",
        variant: "destructive",
      });
      return;
    }
    setOpenDeleteDialog(true);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Colunas
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" align="start">
            <div className="p-3 grid gap-2 max-h-80 overflow-y-auto">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={column.id}
                    checked={column.visible}
                    onCheckedChange={() => handleColumnVisibilityChange(column.id)}
                  />
                  <label 
                    htmlFor={column.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Visualização
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
        <Button className="gap-2 bg-primary text-white" onClick={() => navigate('/task-management/new')}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <Button variant="destructive" size="sm" onClick={handleDeleteConfirmation} disabled={selectedTasks.length === 0} className="gap-2">
        <Trash2 className="h-4 w-4" />
        Excluir Tarefas
      </Button>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir as tarefas selecionadas? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
