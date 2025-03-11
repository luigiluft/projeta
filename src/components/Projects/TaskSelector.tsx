
import { Task } from "@/types/project";
import { useState, useEffect } from "react";
import { EpicSelector } from "./EpicSelector";

interface TaskSelectorProps {
  availableEpics: string[];
  epicTasks: { [key: string]: Task[] };
  selectedEpics: string[];
  onEpicsChange: (epics: string[]) => void;
  onTasksChange: (tasks: Task[]) => void;
  readOnly?: boolean;
}

export function TaskSelector({
  availableEpics,
  epicTasks,
  selectedEpics,
  onEpicsChange,
  onTasksChange,
  readOnly = false
}: TaskSelectorProps) {
  useEffect(() => {
    const tasks: Task[] = [];
    selectedEpics.forEach(epic => {
      if (epicTasks[epic]) {
        tasks.push(...epicTasks[epic]);
      }
    });
    onTasksChange(tasks);
  }, [selectedEpics, epicTasks, onTasksChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Epics do Projeto</h3>
      <EpicSelector 
        availableEpics={availableEpics} 
        selectedEpics={selectedEpics}
        onChange={onEpicsChange}
        readOnly={readOnly}
      />
    </div>
  );
}
