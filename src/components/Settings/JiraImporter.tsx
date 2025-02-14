import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Project } from "@/types/project";

export function JiraImporter({ onImport }: { onImport: (projects: Project[]) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo CSV para importar');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());

        const projects: Project[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          try {
            const values = lines[i].split(',').map(value => value.trim());
            
            const project: Project = {
              id: crypto.randomUUID(),
              name: values[headers.indexOf('Resumo')] || `Projeto ${i}`,
              epic: values[headers.indexOf('Epic')] || `Epic ${i}`,
              type: 'default',
              created_at: new Date().toISOString(),
              total_hours: 0,
              tasks: [],
              attributes: {}, // Adicionado o campo attributes obrigatório
            };

            projects.push(project);
          } catch (lineError) {
            console.error(`Erro ao processar linha ${i + 1}:`, lineError);
            toast.error(`Erro ao processar linha ${i + 1} do arquivo CSV`);
          }
        }

        if (projects.length > 0) {
          onImport(projects);
          toast.success(`${projects.length} projetos importados com sucesso!`);
        } else {
          toast.error('Nenhum projeto foi importado. Verifique o formato do arquivo.');
        }
      } catch (error) {
        console.error('Erro ao processar CSV:', error);
        toast.error('Erro ao processar o arquivo CSV. Verifique o formato do arquivo.');
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo');
      setIsLoading(false);
    };

    reader.readAsText(selectedFile);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Importar Projetos do Jira</h3>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Faça upload de um arquivo CSV exportado do Jira para importar projetos.
          O arquivo deve conter os campos necessários como Tipo de item, Chave da item, etc.
        </p>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isLoading}
            className="max-w-sm"
          />
          <Button 
            onClick={handleImport}
            disabled={isLoading || !selectedFile}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Importando...' : 'Importar CSV'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
