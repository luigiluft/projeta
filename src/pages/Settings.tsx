import { JiraImporter } from "@/components/Settings/JiraImporter";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { projects, handleSubmit } = useProjects();

  const handleImport = (importedProjects: Project[]) => {
    importedProjects.forEach(project => {
      handleSubmit(project);
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações</h1>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="icon">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-48" align="end">
            <nav className="space-y-2">
              <Link 
                to="/settings/import" 
                className="block w-full p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Importação de dados
              </Link>
              <Link 
                to="/settings/user-approval" 
                className="block w-full p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Usuários
              </Link>
              <Link 
                to="/settings/roles" 
                className="block w-full p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Permissões
              </Link>
            </nav>
          </HoverCardContent>
        </HoverCard>
      </div>
      
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