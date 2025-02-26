
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskDependency } from "@/types/project";
import { Plus, Trash2 } from "lucide-react";

interface DependenciesListProps {
  dependencies: TaskDependency[];
  onAddDependency: () => void;
  onRemoveDependency: (id: string) => void;
}

export function DependenciesList({ 
  dependencies, 
  onAddDependency, 
  onRemoveDependency 
}: DependenciesListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Dependências</h2>
        <Button onClick={onAddDependency} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {dependencies.length > 0 ? (
        <div className="space-y-2">
          {dependencies.map((dep) => (
            <div key={dep.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <span>{dep.dependency?.task_name}</span>
                <Badge>{dep.dependency?.status}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveDependency(dep.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Esta tarefa não possui dependências</p>
      )}
    </div>
  );
}
