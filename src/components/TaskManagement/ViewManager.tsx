import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { View } from "@/types/project";

interface ViewManagerProps {
  onSaveView: () => void;
  onLoadView: (view: View) => void;
  savedViews: View[];
}

export function ViewManager({ onSaveView, onLoadView, savedViews }: ViewManagerProps) {
  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido. Remova uma visualização antes de adicionar outra.");
      return;
    }
    onSaveView();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Visualização
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-lg">
        <DropdownMenuItem onClick={handleSaveView}>
          Salvar Visualização Atual
        </DropdownMenuItem>
        {savedViews.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {savedViews.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onClick={() => onLoadView(view)}
              >
                {view.name}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}