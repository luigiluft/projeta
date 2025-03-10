
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { useProjectForm } from "@/hooks/useProjectForm";
import { PROJECT_ATTRIBUTES } from "@/constants/projectAttributes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/project";

export default function NewProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [availableEpics, setAvailableEpics] = useState<string[]>([]);
  const [epicTasks, setEpicTasks] = useState<Task[]>([]);
  const { project, handleSubmit } = useProjectForm(id);

  // Carregar epics disponíveis
  useEffect(() => {
    async function loadAvailableEpics() {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('epic')
          .is('epic', 'not.null')
          .not('epic', 'eq', '')
          .order('epic');

        if (error) throw error;

        // Extrair valores únicos de epic
        const uniqueEpics = Array.from(new Set(data.map(item => item.epic)))
          .filter(Boolean) as string[];

        setAvailableEpics(uniqueEpics);
      } catch (error) {
        console.error('Erro ao carregar epics:', error);
        toast.error('Erro ao carregar epics disponíveis');
      }
    }

    loadAvailableEpics();
  }, []);

  const handleFormSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      await handleSubmit(values);
      navigate("/projects");
    } catch (error) {
      toast.error("Erro ao salvar projeto");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para carregar tarefas de um epic quando selecionado
  const loadEpicTasks = async (selectedEpics: string[]) => {
    if (!selectedEpics.length) {
      setEpicTasks([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('epic', selectedEpics)
        .order('order', { ascending: true });

      if (error) throw error;
      
      setEpicTasks(data as Task[]);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas dos epics');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? "Editar Projeto" : "Cadastrar Projeto"}
        </h1>
      </div>
      <ProjectForm
        editingId={id || null}
        attributes={PROJECT_ATTRIBUTES}
        onSubmit={handleFormSubmit}
        initialValues={project}
        availableEpics={availableEpics}
        epicTasks={epicTasks}
        onEpicsChange={loadEpicTasks}
        isLoading={isLoading}
      />
    </div>
  );
}
