
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableEpics.map((epic) => (
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
          ))}
          {availableEpics.length === 0 && (
            <p className="text-muted-foreground col-span-full">Nenhum epic disponível</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
