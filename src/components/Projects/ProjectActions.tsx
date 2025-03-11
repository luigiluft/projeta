
import { Button } from "@/components/ui/button";

interface ProjectActionsProps {
  isLoading?: boolean;
  editingId?: string | null;
  readOnly?: boolean;
}

export function ProjectActions({ isLoading, editingId, readOnly }: ProjectActionsProps) {
  if (readOnly) return null;

  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : (editingId ? "Atualizar" : "Criar")} Projeto
      </Button>
    </div>
  );
}
