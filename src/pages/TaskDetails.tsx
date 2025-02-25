
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium">Tarefa não encontrada</h2>
          <Button variant="link" onClick={() => navigate('/task-management')}>
            Voltar para lista de tarefas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/task-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Tarefa</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{task.task_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-500">Informações Básicas</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Fase:</span> {task.phase}</p>
                  <p><span className="font-medium">Epic:</span> {task.epic}</p>
                  <p><span className="font-medium">Story:</span> {task.story}</p>
                  <p><span className="font-medium">Responsável:</span> {task.owner}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-500">Status e Progresso</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant="outline">
                      {task.status}
                    </Badge>
                  </div>
                  <p><span className="font-medium">Horas Estimadas:</span> {task.hours}h</p>
                  <p><span className="font-medium">Horas Realizadas:</span> {task.actual_hours}h</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-gray-500">Datas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Data de Início</p>
                  <p className="font-medium">
                    {task.start_date ? format(new Date(task.start_date), "dd/MM/yyyy") : "Não definida"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Término</p>
                  <p className="font-medium">
                    {task.end_date ? format(new Date(task.end_date), "dd/MM/yyyy") : "Não definida"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Previsão de Conclusão</p>
                  <p className="font-medium">
                    {task.estimated_completion_date 
                      ? format(new Date(task.estimated_completion_date), "dd/MM/yyyy") 
                      : "Não definida"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-gray-500">Dependências</h3>
              <p>{task.dependency || "Nenhuma dependência"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
