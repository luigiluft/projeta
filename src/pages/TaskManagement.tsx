
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { TaskList } from '@/components/TaskManagement/TaskList';
import { TaskTreeView } from '@/components/TaskManagement/TaskTreeView';
import { TaskHeader } from '@/components/TaskManagement/TaskHeader';
import { TaskImporter } from '@/components/TaskManagement/TaskImporter';
import { type Task, type Column } from '@/types/project';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TaskManagement() {
  const navigate = useNavigate();
  const { 
    tasks, 
    columns, 
    loading, 
    error, 
    deleteTasks, 
    handleColumnVisibilityChange,
    handleColumnsChange,
    refreshTasks,
    viewMode,
    handleViewModeChange
  } = useTaskManagement();
  
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks((prev) => [...prev, taskId]);
    } else {
      setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const confirmDelete = async () => {
    try {
      console.log("Confirmando exclusão das tarefas:", selectedTasks);
      await deleteTasks(selectedTasks);
      setSelectedTasks([]);
    } catch (error) {
      console.error("Erro ao excluir tarefas:", error);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleImportSuccess = () => {
    refreshTasks();
    toast.success("Tarefas importadas com sucesso!");
  };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;
  if (error) return <div className="text-red-500 p-4">Erro ao carregar tarefas: {error.message}</div>;

  return (
    <div className="container mx-auto py-8">
      <Card className="bg-white shadow">
        <CardHeader className="pb-0 bg-gray-50">
          <div className="flex justify-between items-center">
            <TaskHeader 
              columns={columns}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              {selectedTasks.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Tarefas ({selectedTasks.length})
                </Button>
              )}
            </div>
          </div>
          
          {viewMode === 'table' ? (
            <TaskList 
              tasks={tasks} 
              columns={columns}
              onColumnsChange={handleColumnsChange}
              onTaskSelect={handleTaskSelection}
              selectedTasks={selectedTasks}
            />
          ) : (
            <TaskTreeView 
              tasks={tasks} 
              onTaskSelect={handleTaskSelection}
              selectedTasks={selectedTasks}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedTasks.length} {selectedTasks.length === 1 ? 'tarefa' : 'tarefas'}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
