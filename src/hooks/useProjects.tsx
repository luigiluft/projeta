
import { Project, Task, View } from "@/types/project";
import { useProjectsQuery } from "./projects/useProjectsQuery";
import { useProjectMutations } from "./projects/useProjectMutations";
import { useProjectViews } from "./projects/useProjectViews";

export const useProjects = () => {
  // Buscar projetos usando o hook de query
  const { data: projects = [], isError } = useProjectsQuery();
  
  // Obter funções de mutação para projetos
  const { handleSubmit, handleDelete } = useProjectMutations();
  
  // Obter visualizações salvas
  const { savedViews, handleSaveView } = useProjectViews();

  // Retornar todos os dados e funções necessárias
  return {
    projects,
    savedViews,
    isError,
    handleSubmit,
    handleDelete,
    handleSaveView,
  };
};
