
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Dependency {
  id: string;
  task_id: string;
  depends_on: string;
  created_at: string;
  dependency?: {
    task_name: string;
    [key: string]: any;
  };
}

interface DependenciesListProps {
  dependencies: Dependency[];
  onAddDependency: () => void;
  onRemoveDependency: (id: string) => void;
}

export function DependenciesList({ dependencies, onAddDependency, onRemoveDependency }: DependenciesListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Dependências</h2>
        <Button onClick={onAddDependency} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Dependência
        </Button>
      </div>

      {dependencies.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma dependência cadastrada.</p>
      ) : (
        <ul className="space-y-2">
          {dependencies.map((dep) => (
            <li key={dep.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">
                {dep.dependency?.task_name || dep.depends_on}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveDependency(dep.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
