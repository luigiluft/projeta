
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Dependency {
  id: string;
  task_name: string;
}

interface DependenciesListProps {
  taskId: string;
  dependencyTask?: Dependency;
  onAddDependency: () => void;
  onRemoveDependency: () => void;
}

export function DependenciesList({ 
  taskId, 
  dependencyTask, 
  onAddDependency, 
  onRemoveDependency 
}: DependenciesListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Dependências</h2>
        <Button onClick={onAddDependency} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Dependência
        </Button>
      </div>

      {!dependencyTask ? (
        <p className="text-muted-foreground text-sm">Nenhuma dependência cadastrada.</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm">{dependencyTask.task_name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveDependency}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
