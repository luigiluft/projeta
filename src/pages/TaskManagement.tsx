
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { TaskList } from '@/components/TaskManagement/TaskList';
import { TaskHeader } from '@/components/TaskManagement/TaskHeader';
import { type Task, type Column } from '@/types/project';

export default function TaskManagement() {
  const { 
    tasks, 
    columns, 
    loading, 
    error, 
    deleteTasks, 
    handleColumnVisibilityChange,
    handleColumnsChange 
  } = useTaskManagement();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks((prev) => [...prev, taskId]);
    } else {
      setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleDeleteTasks = (taskIds: string[]) => {
    deleteTasks(taskIds);
    setSelectedTasks([]);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;
  if (error) return <div className="text-red-500 p-4">Erro ao carregar tarefas: {error.message}</div>;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Tarefas</CardTitle>
          <TaskHeader 
            selectedTasks={selectedTasks} 
            onDeleteTasks={handleDeleteTasks} 
          />
        </CardHeader>
        <CardContent>
          <TaskList 
            tasks={tasks} 
            columns={columns}
            onColumnsChange={handleColumnsChange}
            onTaskSelect={handleTaskSelection}
            selectedTasks={selectedTasks}
          />
        </CardContent>
      </Card>
    </div>
  );
}
