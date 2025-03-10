
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface EpicSelectorProps {
  availableEpics: string[];
  selectedEpics: string[];
  onChange: (selectedEpics: string[]) => void;
}

export function EpicSelector({ availableEpics, selectedEpics, onChange }: EpicSelectorProps) {
  const handleEpicChange = (epic: string, checked: boolean) => {
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
              <Checkbox 
                id={`epic-${epic}`} 
                checked={selectedEpics.includes(epic)}
                onCheckedChange={(checked) => handleEpicChange(epic, checked === true)}
              />
              <Label htmlFor={`epic-${epic}`} className="cursor-pointer">
                {epic}
              </Label>
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
