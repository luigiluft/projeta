import { JiraImporter } from "@/components/Settings/JiraImporter";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";

export default function Settings() {
  const { projects, handleSubmit } = useProjects();

  const handleImport = (importedProjects: Project[]) => {
    importedProjects.forEach(project => {
      handleSubmit(project);
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <div className="grid gap-6">
        <JiraImporter onImport={handleImport} />
      </div>
    </div>
  );
}