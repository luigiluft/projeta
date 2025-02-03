import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database, Save } from "lucide-react";

interface View {
  id: string;
  name: string;
  columns: string[];
}

interface ViewManagerProps {
  onSaveView: () => void;
  onLoadView: (view: View) => void;
  savedViews: View[];
}

export function ViewManager({ onSaveView, onLoadView, savedViews }: ViewManagerProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onSaveView}>
        <Save className="mr-2 h-4 w-4" />
        Salvar Visualização
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Database className="mr-2 h-4 w-4" />
            Carregar Visualização
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {savedViews.map((view) => (
            <DropdownMenuItem
              key={view.id}
              onClick={() => onLoadView(view)}
            >
              {view.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}