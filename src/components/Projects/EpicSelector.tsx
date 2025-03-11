
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

  // Separar epics entre implementação e sustentação
  const implementationEpics = availableEpics.filter(epic => 
    !epic.toLowerCase().includes('sustentação') && 
    !epic.toLowerCase().includes('sustentacao'));
  
  const sustainmentEpics = availableEpics.filter(epic => 
    epic.toLowerCase().includes('sustentação') || 
    epic.toLowerCase().includes('sustentacao'));

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
                {implementationEpics.length > 0 ? (
                  implementationEpics.map((epic) => (
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
                {sustainmentEpics.length > 0 ? (
                  sustainmentEpics.map((epic) => (
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
