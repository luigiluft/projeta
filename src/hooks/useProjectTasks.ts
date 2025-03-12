
import { useState } from "react";
import { Task, Column } from "@/types/project";

export const useProjectTasks = (initialTasks: Task[] = []) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const taskColumns: Column[] = [
    { id: "task_name", label: "Tarefa", visible: true },
    { id: "phase", label: "Fase", visible: true },
    { id: "epic", label: "Epic", visible: true },
    { id: "story", label: "Story", visible: true },
    { id: "hours", label: "Horas", visible: true },
    { id: "owner", label: "Responsável", visible: true },
    { id: "depends_on", label: "Dependência", visible: true },
    { id: "order", label: "Ordem", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "created_at", label: "Criado em", visible: true },
  ];

  const handleColumnsChange = (newColumns: Column[]) => {
    // Implementar lógica de atualização de colunas se necessário
    console.log("Columns changed:", newColumns);
  };

  return {
    tasks,
    taskColumns,
    handleColumnsChange
  };
};
