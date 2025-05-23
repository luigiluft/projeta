
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface EpicSelectorProps {
  availableEpics: string[];
  selectedEpics: string[];
  onChange: (selectedEpics: string[]) => void;
  readOnly?: boolean;
}

export function EpicSelector({ availableEpics, selectedEpics, onChange, readOnly = false }: EpicSelectorProps) {
  const [implementationEpics, setImplementationEpics] = useState<string[]>([]);
  const [sustainmentEpics, setSustainmentEpics] = useState<string[]>([]);
  
  useEffect(() => {
    console.log("EpicSelector received availableEpics:", availableEpics);
    
    // Classificar os epics com base nas fases das tasks
    const loadEpicsByPhase = async () => {
      try {
        if (!availableEpics || availableEpics.length === 0) {
          console.log("Nenhum epic disponível para classificar");
          return;
        }
        
        // Criar mapa para guardar a classificação de cada epic
        const epicPhaseMap = new Map<string, string>();
        
        // Buscar tasks diretamente para cada epic disponível
        for (const epic of availableEpics) {
          const { data: epicTasks, error } = await supabase
            .from('tasks')
            .select('epic, phase')
            .eq('epic', epic)
            .limit(10);
            
          if (error) {
            console.error(`Erro ao carregar dados de tarefas para epic ${epic}:`, error);
            continue;
          }
          
          console.log(`Tarefas encontradas para epic ${epic}:`, epicTasks?.length);
          
          // Se encontrou tarefas para este epic, verifica a fase
          if (epicTasks && epicTasks.length > 0) {
            // Usar a fase da primeira tarefa como referência
            // Normalizar o valor da fase para minúsculas
            let phase = epicTasks[0].phase?.toLowerCase() || '';
            
            // Verificar se a fase é sustentação (com ou sem acentos)
            if (phase === 'sustentação' || phase === 'sustentacao') {
              epicPhaseMap.set(epic, 'sustentação');
            } else {
              // Se não for sustentação ou se não tiver fase, consideramos como implementação
              epicPhaseMap.set(epic, 'implementação');
            }
          } else {
            // Se não encontrou tarefas, considera como implementação por padrão
            epicPhaseMap.set(epic, 'implementação');
          }
        }
        
        console.log("Mapa de epic -> phase completo:", Object.fromEntries(epicPhaseMap));
        
        // Classificar epics disponíveis com base no mapa
        const implementation = availableEpics.filter(epic => 
          epicPhaseMap.get(epic) === 'implementação');
        
        const sustainment = availableEpics.filter(epic => 
          epicPhaseMap.get(epic) === 'sustentação');
        
        // Se um epic não estiver no mapa, coloque-o em implementação por padrão
        const unclassified = availableEpics.filter(epic => 
          !epicPhaseMap.has(epic));
          
        console.log("Epics de implementação:", implementation);
        console.log("Epics de sustentação:", sustainment);
        console.log("Epics não classificados:", unclassified);
          
        setImplementationEpics([...implementation, ...unclassified]);
        setSustainmentEpics(sustainment);
      } catch (error) {
        console.error("Erro ao carregar as fases dos epics:", error);
      }
    };
    
    loadEpicsByPhase();
  }, [availableEpics]);

  const handleEpicChange = (epic: string, checked: boolean) => {
    if (readOnly) return;
    
    if (checked) {
      onChange([...selectedEpics, epic]);
    } else {
      onChange(selectedEpics.filter(e => e !== epic));
    }
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
  const sortBySpecificOrder = (epics: string[] | undefined, order: string[]) => {
    if (!epics || epics.length === 0) return [];
    
    return [...epics].sort((a, b) => {
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
