
import { useState, useEffect } from "react";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, Attribute, Project } from "@/types/project";
import { useNavigate } from "react-router-dom";

export default function NewProject() {
  const navigate = useNavigate();
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

      // Transformar os dados para o formato de Attribute
      const formattedAttributes: Attribute[] = data.map(attr => {
        // Garantir que unit seja um dos valores permitidos pelo tipo Attribute
        let unit: "hours" | "quantity" | "percentage" = "hours";
        if (attr.unit === "quantity" || attr.unit === "percentage") {
          unit = attr.unit;
        }

        // Determinar o tipo com base na unidade
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
      
      // Buscar epics distintos das tarefas
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

  const handleEpicsChange = (selectedEpics: string[]) => {
    console.log("Epics selecionados:", selectedEpics);
  };

  const handleSubmit = async (project: Project) => {
    try {
      setIsLoading(true);
      
      // Store attribute values in the metadata field
      const metadata = {
        attribute_values: project.attribute_values || {}
      };
      
      // Inserir o projeto - correção do formato dos dados
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          id: project.id,
          name: project.name,
          project_name: project.name,
          description: project.description,
          client_name: project.client_name,
          start_date: project.start_date,
          epic: project.epic,
          total_hours: project.total_hours,
          total_cost: project.total_cost,
          base_cost: project.base_cost,
          profit_margin: project.profit_margin,
          status: project.status,
          currency: project.currency,
          progress: 0,
          delay_days: 0,
          attributes: project.attributes,
          metadata: metadata,
          type: 'default' // Adicionar o tipo exigido pelo schema
        })
        .select()
        .single();

      if (projectError) {
        throw projectError;
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
