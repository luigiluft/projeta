
import { useState, useEffect } from "react";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, Attribute, Project } from "@/types/project";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export default function NewProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availableEpics, setAvailableEpics] = useState<string[]>([]);
  const [epicTasks, setEpicTasks] = useState<{ [key: string]: Task[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  useEffect(() => {
    loadAvailableEpics();
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      const { data, error } = await supabase
        .from('project_attributes')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Erro ao carregar atributos:", error);
        toast.error("Erro ao carregar atributos");
        return;
      }

      console.log("Atributos carregados:", data);

      const formattedAttributes: Attribute[] = data.map(attr => {
        let unit: "hours" | "quantity" | "percentage" = "hours";
        if (attr.unit === "quantity" || attr.unit === "percentage") {
          unit = attr.unit;
        }

        let type: "number" | "list" | "text" = "number";
        if (attr.unit === "list") {
          type = "list";
        } else if (attr.unit !== "hours" && attr.unit !== "quantity" && attr.unit !== "percentage") {
          type = "text";
        }

        return {
          id: attr.code,
          name: attr.name,
          unit,
          type,
          defaultValue: attr.default_value
        };
      });

      console.log("Atributos formatados:", formattedAttributes);
      setAttributes(formattedAttributes);
    } catch (e) {
      console.error("Erro não tratado ao carregar atributos:", e);
    }
  };

  const loadAvailableEpics = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('epic')
        .not('epic', 'is', null)
        .not('epic', 'eq', '')
        .order('epic', { ascending: true });

      if (error) {
        console.error("Erro ao carregar epics:", error);
        toast.error("Erro ao carregar epics");
        setIsLoading(false);
        return;
      }

      const epics = [...new Set(data.map(item => item.epic))];
      setAvailableEpics(epics);

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

  const handleEpicsChange = (selectedEpics: string[]) => {
    console.log("Epics selecionados:", selectedEpics);
  };

  const handleSubmit = async (project: Project) => {
    try {
      setIsLoading(true);
      console.log("Projeto enviado para criação:", project);
      
      // Log do usuário atual
      console.log("Usuário logado:", user);
      
      const projectData = {
        name: project.name,
        project_name: project.name,
        description: project.description || "",
        client_name: project.client_name || "",
        start_date: project.start_date || null,
        epic: project.epic || "",
        total_hours: project.total_hours || 0,
        total_cost: project.total_cost || 0,
        base_cost: project.base_cost || 0,
        profit_margin: project.profit_margin || 0,
        status: "draft" as const,
        currency: "BRL" as const,
        type: "default",
        metadata: { attribute_values: project.attribute_values || {} },
        // Adicionando owner_id se o usuário estiver autenticado
        owner_id: user?.id || null
      };
      
      console.log("Dados do projeto formatados para inserção:", projectData);
      
      // Inserir o projeto
      const { data: projectResponse, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) {
        console.error("Erro ao inserir projeto:", projectError);
        throw projectError;
      }

      console.log("Projeto criado com sucesso:", projectResponse);
      
      // Verificar e preparar as tarefas do projeto
      if (project.tasks && project.tasks.length > 0) {
        console.log("Tarefas a serem inseridas:", project.tasks);
        
        const projectTasksData = project.tasks.map(task => ({
          project_id: projectResponse.id,
          task_id: task.id,
          calculated_hours: task.calculated_hours || task.fixed_hours || 0,
          status: 'pending',
          is_active: true,
          created_at: new Date().toISOString()
        }));
        
        console.log("Dados formatados das tarefas do projeto:", projectTasksData);
        
        // Inserir as tarefas associadas ao projeto
        const { data: tasksData, error: tasksError } = await supabase
          .from('project_tasks')
          .insert(projectTasksData)
          .select();
          
        if (tasksError) {
          console.error("Erro ao inserir tarefas do projeto:", tasksError);
          toast.error("Erro ao associar tarefas ao projeto");
          throw tasksError;
        }
        
        console.log("Tarefas do projeto inseridas com sucesso:", tasksData);
      } else {
        console.log("Nenhuma tarefa para inserir neste projeto");
      }

      toast.success("Projeto criado com sucesso!");
      navigate("/projects");
    } catch (error: any) {
      console.error("Erro ao criar projeto:", error);
      toast.error(`Erro ao criar projeto: ${error.message || 'Erro desconhecido'}`);
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
        attributes={attributes}
        onSubmit={handleSubmit}
        onEpicsChange={handleEpicsChange}
      />
    </div>
  );
}
