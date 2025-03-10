
import { useState, useEffect } from "react";
import { Project, Task } from "@/types/project";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useProjectForm = (id: string | undefined) => {
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          // Carregar tarefas relacionadas
          const epicList = data.epic ? data.epic.split(', ') : [];
          let allTasks: Task[] = [];
          
          if (epicList.length > 0) {
            const { data: tasksData, error: tasksError } = await supabase
              .from('tasks')
              .select('*')
              .in('epic', epicList);

            if (tasksError) throw tasksError;
            
            if (tasksData && tasksData.length > 0) {
              allTasks = tasksData as Task[];
            }
          }
          
          setProject({
            ...data,
            tasks: allTasks,
            attributes: data.attributes || {},
          } as Project);
        }
      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
        toast.error("Erro ao carregar dados do projeto");
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [id]);

  const handleSubmit = async (values: Project) => {
    try {
      setIsLoading(true);
      
      // Criar ou atualizar projeto no Supabase
      const { error } = await supabase
        .from('projects')
        .upsert({
          id: values.id,
          name: values.name,
          project_name: values.project_name,
          type: values.type,
          description: values.description,
          client_name: values.client_name,
          due_date: values.due_date,
          epic: values.epic,
          total_hours: values.total_hours,
          base_cost: values.base_cost,
          total_cost: values.total_cost,
          profit_margin: values.profit_margin,
          status: values.status,
          currency: values.currency,
          progress: values.progress,
          delay_days: values.delay_days,
          favorite: values.favorite,
          priority: values.priority,
          tags: values.tags,
          archived: values.archived,
          deleted: values.deleted,
          version: values.version,
          attributes: values.attributes,
          metadata: values.metadata,
          settings: values.settings,
        });

      if (error) throw error;
      
      toast.success(id ? "Projeto atualizado com sucesso!" : "Projeto criado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      toast.error("Erro ao salvar projeto");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    project,
    handleSubmit,
    isLoading,
  };
};
