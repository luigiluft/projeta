import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TaskForm } from "@/components/TaskManagement/TaskForm";

export default function NewTask() {
  const navigate = useNavigate();

  const handleSubmit = (values: any) => {
    console.log(values);
    navigate("/task-management");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/task-management")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Cadastrar Tarefa</h1>
      </div>
      <TaskForm onSubmit={handleSubmit} />
    </div>
  );
}