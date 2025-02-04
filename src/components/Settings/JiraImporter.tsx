import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Project } from "@/types/project";

export function JiraImporter({ onImport }: { onImport: (projects: Project[]) => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');

        const projects: Project[] = [];
        
        // Skip header row, process each line
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const project: Project = {
            id: crypto.randomUUID(),
            name: values[headers.indexOf('Project Name')]?.trim() || `Project ${i}`,
            attributes: {},
          };

          // Map other Jira fields to project attributes
          project.attributes = {
            ordersPerMonth: "0",
            averageTicket: "0",
            skuCount: "0",
            // ... default values for other required attributes
          };

          projects.push(project);
        }

        onImport(projects);
        toast.success(`${projects.length} projetos importados com sucesso!`);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Erro ao processar o arquivo CSV. Verifique o formato do arquivo.');
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Importar Projetos do Jira</h3>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Faça upload de um arquivo CSV exportado do Jira para importar projetos.
          O arquivo deve conter pelo menos uma coluna "Project Name".
        </p>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="max-w-sm"
          />
          <Button disabled={isLoading} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Importando...' : 'Importar CSV'}
          </Button>
        </div>
      </div>
    </Card>
  );
}