
interface EmptyTasksProps {
  message?: string;
}

export function EmptyTasks({ message = "Nenhuma tarefa selecionada" }: EmptyTasksProps) {
  return (
    <div className="p-8 text-center border rounded-md bg-gray-50">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
