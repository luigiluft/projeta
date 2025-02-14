
import { JiraImporter } from "@/components/Settings/JiraImporter";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";

export default function Import() {
  const { handleSubmit } = useProjects();

  const handleImport = (importedProjects: Project[]) => {
    importedProjects.forEach(project => {
      handleSubmit(project.tasks);
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Importação de Dados</h1>
      <JiraImporter onImport={handleImport} />
    </div>
  );
}
