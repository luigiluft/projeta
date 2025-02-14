
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Project } from "@/types/project";

interface JiraImporterProps {
  onImport: (importedProjects: Project[]) => void;
}

export function JiraImporter({ onImport }: JiraImporterProps) {
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined
  );

  const handleProjectNameChange = (e: any) => {
    setSelectedProject(e.target.value);
  };

  const handleSync = async () => {
    if (!selectedProject) return;

    const mockProject: Project = {
      id: crypto.randomUUID(),
      name: selectedProject,
      project_name: selectedProject,
      epic: selectedProject,
      type: "default",
      created_at: new Date().toISOString(),
      total_hours: 0,
      total_cost: 0,
      base_cost: 0,
      profit_margin: 30.00,
      status: 'draft',
      currency: 'BRL',
      tasks: [],
      progress: 0,
      delay_days: 0,
      attributes: {},
    };

    onImport([mockProject]);
    toast.success("Projeto sincronizado com sucesso!");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sincronizar com Jira</CardTitle>
        <CardDescription>
          Importe seus projetos diretamente do Jira.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome do Projeto</Label>
          <Input
            id="name"
            placeholder="Nome do projeto no Jira"
            onChange={handleProjectNameChange}
          />
        </div>
        <Button onClick={handleSync}>Sincronizar</Button>
      </CardContent>
    </Card>
  );
}
