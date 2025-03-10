
import { useState, useEffect } from "react";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "@/types/project";

export default function NewProject() {
  const [availableEpics, setAvailableEpics] = useState<string[]>([]);
  const [epicTasks, setEpicTasks] = useState<{ [key: string]: Task[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAvailableEpics();
  }, []);

  const loadAvailableEpics = async () => {
    try {
      setIsLoading(true);
      
      // Buscar epics distintos das tarefas
      const { data, error } = await supabase
        .from('tasks')
        .select('epic')
        .not('epic', 'is', null) // Usar 'is' em vez de 'is.not.null'
        .not('epic', 'eq', '')   // Não incluir strings vazias
        .order('epic', { ascending: true });

      if (error) {
        console.error("Erro ao carregar epics:", error);
        toast.error("Erro ao carregar epics");
        setIsLoading(false);
        return;
      }

      // Extrair epics únicos
      const epics = [...new Set(data.map(item => item.epic))];
      setAvailableEpics(epics);

      // Para cada epic, carregar suas tarefas
      const tasksMap: { [key: string]: Task[] } = {};
      for (const epic of epics) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('epic', epic);

        if (tasksError) {
          console.error(`Erro ao carregar tarefas do epic ${epic}:`, tasksError);
          continue;
        }

        if (tasksData && tasksData.length > 0) {
          // Mapear as propriedades e garantir que o tipo Task seja respeitado
          const formattedTasks: Task[] = tasksData.map((task, index) => ({
            ...task,
            order_number: index + 1,
            is_active: task.is_active || true,
            phase: task.phase || '',
            epic: task.epic || '',
            story: task.story || '',
            owner: task.owner || '',
            status: (task.status as "pending" | "in_progress" | "completed") || "pending",
          }));
          
          tasksMap[epic] = formattedTasks;
        }
      }
      
      setEpicTasks(tasksMap);
    } catch (e) {
      console.error("Erro não tratado ao carregar epics:", e);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Novo Projeto</h1>
      
      <ProjectForm 
        availableEpics={availableEpics}
        epicTasks={epicTasks}
        isLoading={isLoading}
      />
    </div>
  );
}
