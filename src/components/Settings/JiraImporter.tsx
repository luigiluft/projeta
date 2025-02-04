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
        
        // Skip header row, process each line
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(value => value.trim());
          
          const project: Project = {
            id: crypto.randomUUID(),
            name: values[headers.indexOf('Resumo')] || `Projeto ${i}`,
            attributes: {
              ordersPerMonth: "0",
              averageTicket: "0",
              skuCount: "0",
            },
            jiraFields: {
              itemType: values[headers.indexOf('Tipo de item')] || '',
              itemKey: values[headers.indexOf('Chave da item')] || '',
              itemId: parseInt(values[headers.indexOf('ID da item')]) || 0,
              summary: values[headers.indexOf('Resumo')] || '',
              assignee: values[headers.indexOf('Responsável')] || '',
              assigneeId: values[headers.indexOf('ID do responsável')] || '',
              reporter: values[headers.indexOf('Relator')] || '',
              reporterId: values[headers.indexOf('ID do relator')] || '',
              priority: values[headers.indexOf('Prioridade')] || '',
              status: values[headers.indexOf('Status')] || '',
              resolution: values[headers.indexOf('Resolução')] || '',
              created: values[headers.indexOf('Criado')] || '',
              updated: values[headers.indexOf('Atualizado')] || '',
              resolved: values[headers.indexOf('Resolvido')] || '',
              components: values[headers.indexOf('Componentes')] || '',
              affectedVersion: values[headers.indexOf('Versão Afetada')] || '',
              fixVersion: values[headers.indexOf('Versão de Correção')] || '',
              sprints: values[headers.indexOf('Sprints')] || '',
              timeTracking: values[headers.indexOf('Histórico de Tempo')] || '',
              internalLinks: [
                values[headers.indexOf('Link de item interno (Cloners)')] || '',
                values[headers.indexOf('Link de item interno (Cloners).1')] || '',
                values[headers.indexOf('Link de item interno (Cloners).2')] || '',
              ].filter(Boolean),
              externalLinks: values[headers.indexOf('Link externo de item (Cloners)')] || '',
              originalEstimate: parseFloat(values[headers.indexOf('Campo personalizado (Original estimate)')]) || 0,
              parentId: parseInt(values[headers.indexOf('Pai')]) || 0,
              parentSummary: values[headers.indexOf('Parent summary')] || '',
              startDate: values[headers.indexOf('Campo personalizado (Start date)')] || '',
              totalOriginalEstimate: parseFloat(values[headers.indexOf('Σ da Estimativa Original')]) || 0,
              totalTimeSpent: parseFloat(values[headers.indexOf('Σ de Tempo Gasto')]) || 0,
              remainingEstimate: parseFloat(values[headers.indexOf('Σ Estimativa de trabalho restante')]) || 0,
            }
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