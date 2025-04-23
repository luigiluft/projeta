
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EpicSelectorProps {
  availableEpics: string[];
  selectedEpics: string[];
  onChange: (selectedEpics: string[]) => void;
  readOnly?: boolean;
}

export function EpicSelector({ availableEpics, selectedEpics, onChange, readOnly = false }: EpicSelectorProps) {
  const handleEpicChange = (epic: string, checked: boolean) => {
    if (readOnly) return;
    
    if (checked) {
      onChange([...selectedEpics, epic]);
    } else {
      onChange(selectedEpics.filter(e => e !== epic));
    }
  };

  // Classificar os epics com base nas fases das tasks
  const { implementationEpics, sustainmentEpics } = async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('epic, phase')
      .not('epic', 'is', null);

    const epicPhaseMap = new Map<string, string>();
    tasks?.forEach(task => {
      if (task.epic) {
        epicPhaseMap.set(task.epic, task.phase || '');
      }
    });

    const implementation = availableEpics.filter(epic => 
      epicPhaseMap.get(epic) === 'implementação');
    
    const sustainment = availableEpics.filter(epic => 
      epicPhaseMap.get(epic) === 'sustentação');

    return {
      implementationEpics: implementation,
      sustainmentEpics: sustainment
    };
  };

  // Definição das ordens específicas para cada categoria
  const implementationOrder = [
    'Implementação Ecommmerce B2C',
    'Implementação Ecommmerce B2B',
    'Implementação Distribuidora Digital',
    'Implementação Hub de Atendimento',
    'Implementação do Anymarket',
    'Implementação ERP AGREGA',
    'Implementação ERP',
    'Integração com Luft digital',
    'Integração com ERP Homologado',
    'Integração com ERP Não- Homologado',
    'Integração com AGRIQ',
    'Integração com CRM'
  ];

  const sustainmentOrder = [
    'Sustentação Ecommerce',
    'Atendimento ao Consumidor (SAC 4.0)',
    'Sustentação do Anymarket',
    'Faturamento e gestao operacional',
    'Faturamento e gestão operacional agrega',
    'Integração com ERP'
  ];

  // Função auxiliar para ordenar epics baseado em uma ordem específica
  const sortBySpecificOrder = (epics: string[], order: string[]) => {
    return epics.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  // Ordenar cada categoria conforme a ordem especificada
  const sortedImplementationEpics = sortBySpecificOrder(implementationEpics, implementationOrder);
  const sortedSustainmentEpics = sortBySpecificOrder(sustainmentEpics, sustainmentOrder);

  return (
    <Card>
      <CardContent className="p-4">
        {availableEpics.length === 0 ? (
          <p className="text-muted-foreground">Nenhum epic disponível</p>
        ) : (
          <div className="space-y-6">
            {/* Seção de Epics de Implementação */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Implementação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedImplementationEpics.length > 0 ? (
                  sortedImplementationEpics.map((epic) => (
                    <div key={epic} className="flex items-center space-x-2">
                      {readOnly ? (
                        <Badge 
                          variant={selectedEpics.includes(epic) ? "default" : "outline"}
                          className={selectedEpics.includes(epic) ? "bg-primary" : "text-muted-foreground"}
                        >
                          {epic}
                        </Badge>
                      ) : (
                        <>
                          <Checkbox 
                            id={`epic-${epic}`} 
                            checked={selectedEpics.includes(epic)}
                            onCheckedChange={(checked) => handleEpicChange(epic, checked === true)}
                            disabled={readOnly}
                          />
                          <Label htmlFor={`epic-${epic}`} className={`cursor-${readOnly ? 'default' : 'pointer'}`}>
                            {epic}
                          </Label>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full">Nenhum epic de implementação disponível</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Seção de Epics de Sustentação */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Sustentação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedSustainmentEpics.length > 0 ? (
                  sortedSustainmentEpics.map((epic) => (
                    <div key={epic} className="flex items-center space-x-2">
                      {readOnly ? (
                        <Badge 
                          variant={selectedEpics.includes(epic) ? "default" : "outline"}
                          className={selectedEpics.includes(epic) ? "bg-primary" : "text-muted-foreground"}
                        >
                          {epic}
                        </Badge>
                      ) : (
                        <>
                          <Checkbox 
                            id={`epic-${epic}`} 
                            checked={selectedEpics.includes(epic)}
                            onCheckedChange={(checked) => handleEpicChange(epic, checked === true)}
                            disabled={readOnly}
                          />
                          <Label htmlFor={`epic-${epic}`} className={`cursor-${readOnly ? 'default' : 'pointer'}`}>
                            {epic}
                          </Label>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full">Nenhum epic de sustentação disponível</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

