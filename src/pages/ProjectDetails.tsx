
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
        if (projectData.metadata && typeof projectData.metadata === 'object') {
          // Verificar se existe attribute_values no metadata
          if (projectData.metadata.attribute_values && typeof projectData.metadata.attribute_values === 'object') {
            attributeValues = { ...projectData.metadata.attribute_values };
          }
        }

        // Verificar se existem atributos na tabela projects diretamente
        if (projectData.attributes && typeof projectData.attributes === 'object') {
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
              projectData.metadata.attribute_values && 
              typeof projectData.metadata.attribute_values === 'object' && 
              projectData.metadata.attribute_values[field] !== undefined) {
            attributeValues[field] = projectData.metadata.attribute_values[field];
          }
          // Se o atributo existe em attributes
          else if (projectData.attributes && 
                  typeof projectData.attributes === 'object' && 
                  projectData.attributes[field] !== undefined) {
            attributeValues[field] = projectData.attributes[field];
          }
        });

        console.log("Valores dos atributos extraídos:", attributeValues);
        console.log("Verificando ticket_medio:", attributeValues.ticket_medio);

        const fullProject = {
          ...projectData,
          tasks: allTasks,
          attribute_values: attributeValues
        } as Project;

        // Extrair epics únicos das tarefas
        const epics = [...new Set(allTasks.map(task => task.epic))].filter(Boolean);
        setAvailableEpics(epics);

        // Organizar tarefas por epic
        const tasksByEpic: { [key: string]: any } = {};
        allTasks.forEach(task => {
          if (task.epic) {
            if (!tasksByEpic[task.epic]) {
              tasksByEpic[task.epic] = [];
            }
            tasksByEpic[task.epic].push(task);
          }
        });
        setEpicTasks(tasksByEpic);

        // Pré-selecionar todos os epics do projeto
        if (fullProject.epic) {
          const projectEpics = fullProject.epic.split(',').map(e => e.trim());
          setSelectedEpics(projectEpics);
        }

        // Log para depuração dos valores dos atributos
        console.log("Projeto carregado com atributos:", attributeValues);
        
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
