import { useState, useEffect } from "react";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, Attribute, Project } from "@/types/project";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availableEpics, setAvailableEpics] = useState<string[]>([]);
  const [epicTasks, setEpicTasks] = useState<{ [key: string]: Task[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  useEffect(() => {
    loadAttributes();
    loadAvailableEpics();
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

      const formattedAttributes: Attribute[] = data.map(attr => {
        let unit: "hours" | "quantity" | "percentage" = "hours";
        if (attr.unit === "quantity" || attr.unit === "percentage") {
          unit = attr.unit as "quantity" | "percentage";
        }

        let type: "number" | "list" | "text" = "number";
        if (attr.unit === "list") {
          type = "list";
        } else if (attr.unit !== "hours" && attr.unit !== "quantity" && attr.unit !== "percentage" && attr.unit !== "currency") {
          type = "text";
        }

        if (attr.code === "ticket_medio" || attr.unit === "currency") {
          type = "number";
        }

        return {
          id: attr.code,
          name: attr.name,
          unit,
          type,
          defaultValue: attr.default_value
        };
      });

      setAttributes(formattedAttributes);
    } catch (e) {
      console.error("Erro não tratado ao carregar atributos:", e);
    }
  };

  const loadAvailableEpics = async () => {
    try {
      setIsLoading(true);
      
      console.log("Iniciando carregamento de epics...");
      
      // Consultar todas as tarefas primeiro
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .not('epic', 'is', null)
        .not('epic', 'eq', '');
      
      if (tasksError) {
        console.error("Erro ao carregar tarefas:", tasksError);
        toast.error("Erro ao carregar tarefas");
        setIsLoading(false);
        return;
      }
      
      console.log("Total de tarefas carregadas:", tasksData?.length);
      
      // Verificar se temos tarefas
      if (!tasksData || tasksData.length === 0) {
        console.log("Nenhuma tarefa encontrada com epics");
        setAvailableEpics([]);
        setEpicTasks({});
        setIsLoading(false);
        return;
      }

      // Extrair epics únicos diretamente das tarefas carregadas
      const epics = [...new Set(tasksData.map(task => task.epic).filter(Boolean))];
      console.log("Epics únicos extraídos:", epics);
      setAvailableEpics(epics);
      
      // Organizar tarefas por epic
      const tasksMap: { [key: string]: Task[] } = {};
      
      for (const epic of epics) {
        const epicTasks = tasksData
          .filter(task => task.epic === epic)
          .map((task, index) => {
            return {
              ...task,
              order_number: index + 1,
              is_active: task.is_active || true,
              phase: task.phase || 'implementação', // Valor padrão se phase não estiver definido
              epic: task.epic || '',
              story: task.story || '',
              owner: task.owner || '',
              status: (task.status as "pending" | "in_progress" | "completed") || "pending",
            };
          });
          
        tasksMap[epic] = epicTasks;
        console.log(`Tarefas para epic ${epic}:`, epicTasks.length);
      }
      
      console.log("Mapa final de tarefas por epic:", Object.keys(tasksMap));
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
      
      // Gerar um nome de projeto padrão se nenhum nome for fornecido
      const projectName = project.name || `Projeto ${new Date().toLocaleDateString()}`;
      
      // Usar a mesma lógica consistente para filtrar tarefas de implementação e sustentação
      const implementationTasks = project.tasks.filter(task => 
        !task.epic.toLowerCase().includes('sustentação') && 
        !task.epic.toLowerCase().includes('sustentacao') &&
        !task.epic.toLowerCase().includes('atendimento ao consumidor') &&
        !task.epic.toLowerCase().includes('sac 4.0') &&
        !task.epic.toLowerCase().includes('faturamento de gestão operacional') &&
        !task.epic.toLowerCase().includes('faturamento de gestao operacional')
      );
      
      const sustainmentTasks = project.tasks.filter(task => 
        task.epic.toLowerCase().includes('sustentação') || 
        task.epic.toLowerCase().includes('sustentacao') ||
        task.epic.toLowerCase().includes('atendimento ao consumidor') ||
        task.epic.toLowerCase().includes('sac 4.0') ||
        task.epic.toLowerCase().includes('faturamento de gestão operacional') ||
        task.epic.toLowerCase().includes('faturamento de gestao operacional')
      );
      
      console.log(`Tarefas de implementação: ${implementationTasks.length}, Tarefas de sustentação: ${sustainmentTasks.length}`);
      
      const projectData = {
        name: projectName,
        project_name: projectName,
        description: project.description || "",
        client_name: project.client_name || "",
        start_date: project.start_date || null,
        expected_end_date: project.expected_end_date || null,
        epic: project.epic || "",
        total_hours: project.total_hours || 0,
        total_cost: project.total_cost || 0,
        base_cost: project.base_cost || 0,
        profit_margin: project.profit_margin || 0,
        status: "draft" as const, 
        currency: "BRL" as const, 
        type: "default",
        metadata: { 
          attribute_values: project.attribute_values || {},
          implementation_tasks_count: implementationTasks.length,
          sustainment_tasks_count: sustainmentTasks.length
        },
        attributes: project.attributes || {}
      };
      
      console.log("Dados do projeto formatados para inserção:", projectData);
      
      const { data: projectResponse, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) {
        console.error("Erro ao inserir projeto:", projectError);
        toast.error(`Erro ao criar projeto: ${projectError.message}`);
        return;
      }

      console.log("Projeto criado com sucesso:", projectResponse);
      
      if (project.tasks && project.tasks.length > 0) {
        console.log("Tarefas a serem inseridas:", project.tasks);
        
        const projectTasksData = project.tasks.map(task => ({
          project_id: projectResponse.id,
          task_id: task.id,
          calculated_hours: task.calculated_hours || task.fixed_hours || 0,
          status: 'pending',
          is_active: true,
          created_at: new Date().toISOString(),
          owner_id: user?.email
        }));
        
        console.log("Dados formatados das tarefas do projeto:", projectTasksData);
        
        const { data: tasksData, error: tasksError } = await supabase
          .from('project_tasks')
          .insert(projectTasksData)
          .select();
          
        if (tasksError) {
          console.error("Erro ao inserir tarefas do projeto:", tasksError);
          toast.error("Erro ao associar tarefas ao projeto");
        } else {
          console.log("Tarefas do projeto inseridas com sucesso:", tasksData);
        }
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
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/projects")}
          className="hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Novo Projeto</h1>
      </div>
      
      <ProjectForm 
        availableEpics={availableEpics}
        epicTasks={epicTasks}
        isLoading={isLoading}
        attributes={attributes}
        onSubmit={handleSubmit}
        onEpicsChange={handleEpicsChange}
        requireProjectName={false}
      />
    </div>
  );
}
