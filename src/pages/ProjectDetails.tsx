
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Project, Attribute } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableEpics, setAvailableEpics] = useState<string[]>([]);
  const [epicTasks, setEpicTasks] = useState<{ [key: string]: any }>({});
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [projectAttributes, setProjectAttributes] = useState<Attribute[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        
        // Verificar se ID é válido
        if (!id) {
          throw new Error('ID do projeto inválido');
        }
        
        console.log("Buscando projeto com ID:", id);
        
        // Buscar o projeto pelo ID
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) {
          throw new Error(`Erro ao buscar projeto: ${projectError.message}`);
        }

        if (!projectData) {
          throw new Error('Projeto não encontrado');
        }

        // Extrair epics do projeto
        const epicList = projectData.epic ? projectData.epic.split(',').map(e => e.trim()) : [];
        console.log("Epics do projeto:", epicList);
        setSelectedEpics(epicList);

        // Buscar tarefas relacionadas ao projeto
        const { data: projectTasksData, error: tasksError } = await supabase
          .from('project_tasks')
          .select(`
            id,
            calculated_hours,
            is_active,
            status,
            start_date,
            end_date,
            owner_id,
            tasks:task_id(*)
          `)
          .eq('project_id', id);

        if (tasksError) {
          console.error(`Erro ao carregar tarefas do projeto ${id}:`, tasksError);
        }

        // Extrair e formatar as tarefas do projeto
        let allTasks = [];
        
        if (projectTasksData && projectTasksData.length > 0) {
          allTasks = projectTasksData.map((ptask, index) => {
            const task = ptask.tasks as any;
            return {
              ...task,
              order_number: index + 1,
              is_active: ptask.is_active,
              phase: task.phase || '',
              epic: task.epic || '',
              story: task.story || '',
              owner: task.owner || ptask.owner_id || '',
              calculated_hours: ptask.calculated_hours,
              status: ptask.status as "pending" | "in_progress" | "completed",
              project_task_id: ptask.id
            };
          });
        }

        // Buscar tarefas por epic para disponibilizar na interface
        const tasksByEpic: { [key: string]: any } = {};
        const uniqueEpics = new Set<string>();

        // Se o projeto tem poucos ou nenhum projeto_tasks, buscar todas as tarefas dos epics
        if (epicList.length > 0 && (!projectTasksData || projectTasksData.length < epicList.length * 3)) {
          console.log("Buscando tarefas por epics:", epicList);

          for (const epic of epicList) {
            try {
              const { data: tasksData, error: epicTasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('epic', epic);

              if (epicTasksError) {
                console.error(`Erro ao buscar tarefas do epic ${epic}:`, epicTasksError);
                continue;
              }

              if (tasksData && tasksData.length > 0) {
                tasksByEpic[epic] = tasksData;
                uniqueEpics.add(epic);
              }
            } catch (e) {
              console.error(`Erro ao processar tarefas para o epic ${epic}:`, e);
            }
          }
        }

        // Adicionar epics encontrados nas tarefas existentes
        allTasks.forEach(task => {
          if (task.epic) {
            uniqueEpics.add(task.epic);
            if (!tasksByEpic[task.epic]) {
              tasksByEpic[task.epic] = [];
            }
            if (!tasksByEpic[task.epic].find((t: any) => t.id === task.id)) {
              tasksByEpic[task.epic].push(task);
            }
          }
        });

        setAvailableEpics(Array.from(uniqueEpics));
        setEpicTasks(tasksByEpic);
        console.log("Tarefas por epic:", tasksByEpic);

        // Buscar atributos de projeto do Supabase
        const { data: attributesData, error: attributesError } = await supabase
          .from('project_attributes')
          .select('*');

        if (attributesError) {
          console.error('Erro ao buscar atributos do projeto:', attributesError);
        }

        // Preparar atributos para o formulário
        const formattedAttributes = (attributesData || []).map(attr => ({
          id: attr.code || attr.id,
          name: attr.name,
          type: attr.unit === 'hours' || attr.unit === 'currency' || attr.unit === 'percentage' ? 'number' : 'text',
          unit: attr.unit || '',
          defaultValue: attr.default_value || '',
          description: attr.description || ''
        })) as Attribute[];

        setProjectAttributes(formattedAttributes);

        // Extrair valores dos atributos do campo metadata
        let attributeValues: Record<string, any> = {};
        
        // Verificar se existe metadata e se é um objeto
        if (projectData.metadata && 
            typeof projectData.metadata === 'object' && 
            !Array.isArray(projectData.metadata)) {
          // Verificar se existe attribute_values no metadata
          if ('attribute_values' in projectData.metadata && 
              projectData.metadata.attribute_values && 
              typeof projectData.metadata.attribute_values === 'object') {
            attributeValues = { ...projectData.metadata.attribute_values };
          }
        }

        // Verificar se existem atributos na tabela projects diretamente
        if (projectData.attributes && 
            typeof projectData.attributes === 'object' && 
            !Array.isArray(projectData.attributes)) {
          Object.entries(projectData.attributes).forEach(([key, value]) => {
            attributeValues[key] = value;
          });
        }

        // Garantir que campos específicos sejam tratados corretamente
        const specificFields = ['tempo_de_atendimento_por_cliente', 'pedidos_mes', 'ticket_medio'];
        specificFields.forEach(field => {
          // Se o atributo existe em metadata.attribute_values
          if (projectData.metadata && 
              typeof projectData.metadata === 'object' && 
              !Array.isArray(projectData.metadata) && 
              'attribute_values' in projectData.metadata && 
              projectData.metadata.attribute_values && 
              typeof projectData.metadata.attribute_values === 'object' && 
              field in projectData.metadata.attribute_values) {
            attributeValues[field] = projectData.metadata.attribute_values[field];
          }
          // Se o atributo existe em attributes
          else if (projectData.attributes && 
                  typeof projectData.attributes === 'object' && 
                  !Array.isArray(projectData.attributes) && 
                  field in projectData.attributes) {
            attributeValues[field] = projectData.attributes[field];
          }
        });

        console.log("Valores dos atributos extraídos:", attributeValues);

        const fullProject = {
          ...projectData,
          tasks: allTasks,
          attribute_values: attributeValues
        } as Project;
        
        setProject(fullProject);
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao carregar projeto:', err);
        setError(err.message || 'Ocorreu um erro ao carregar o projeto');
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Carregando projeto...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Erro</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar projeto</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <Button onClick={handleBack}>Voltar para Projetos</Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Projeto não encontrado</h1>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Projeto não encontrado</AlertTitle>
          <AlertDescription>
            Não foi possível encontrar o projeto solicitado.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <Button onClick={handleBack}>Voltar para Projetos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Projeto</h1>
      </div>
      
      <ProjectForm 
        initialValues={project} 
        availableEpics={availableEpics}
        epicTasks={epicTasks}
        editingId={id}
        readOnly={true}
        selectedEpics={selectedEpics}
        attributes={projectAttributes}
      />
    </div>
  );
}
