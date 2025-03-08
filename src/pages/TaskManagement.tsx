
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { TaskList } from '@/components/TaskManagement/TaskList';
import { TaskHeader } from '@/components/TaskManagement/TaskHeader';
import { type Task, type Column, type View } from '@/types/project';

export default function TaskManagement() {
  const { tasks, columns, savedViews, loading, error, deleteTasks, handleColumnVisibilityChange, handleSaveView, handleLoadView } = useTaskManagement();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks((prev) => [...prev, taskId]);
    } else {
      setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleDeleteTasks = (taskIds: string[]) => {
    setSelectedTasks([]);
  };

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet");
  };

  const handleNewTask = () => {
    console.log("New task");
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar tarefas: {error}</div>;

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
            selectedTasks={selectedTasks}
            onTaskSelection={handleTaskSelection}
          />
        </CardContent>
      </Card>
    </div>
  );
}
