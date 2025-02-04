import { JiraImporter } from "@/components/Settings/JiraImporter";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
          <div className="flex gap-4">
            <Button asChild>
              <Link to="/settings/user-approval">Aprovar Usuários</Link>
            </Button>
            <Button asChild>
              <Link to="/settings/roles">Gerenciar Permissões</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Importação</h2>
          <JiraImporter onImport={handleImport} />
        </div>
      </div>
    </div>
  );
}