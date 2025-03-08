
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useToast } from '@/hooks/use-toast';

interface TaskHeaderProps {
  selectedTasks: string[];
  onDeleteTasks: (taskIds: string[]) => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ selectedTasks, onDeleteTasks }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteTasks } = useTaskManagement();
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
        <Button variant="outline" size="sm" onClick={() => navigate('/task-management/new')}>
          Criar Tarefa
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/task-management/bulk-import')}>
          Importar Tarefas
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDeleteConfirmation} disabled={selectedTasks.length === 0}>
          Excluir Tarefas
        </Button>
      </div>

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
};
