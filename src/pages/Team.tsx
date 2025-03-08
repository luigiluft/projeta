import { useState } from "react";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { TeamList } from "@/components/Team/TeamList";
import { Column, View } from "@/types/project";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  status: "active" | "inactive";
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "João Silva",
    role: "Desenvolvedor Frontend",
    email: "joao@exemplo.com",
    department: "Tecnologia",
    status: "active",
  },
  {
    id: "2",
    name: "Maria Santos",
    role: "Product Manager",
    email: "maria@exemplo.com",
    department: "Produto",
    status: "active",
  },
];

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [savedViews, setSavedViews] = useState<View[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "role", label: "Cargo", visible: true },
    { id: "email", label: "Email", visible: true },
    { id: "department", label: "Departamento", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "actions", label: "Ações", visible: true },
  ]);

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      );
      
      // Always keep the "actions" column visible
      const actionsColumn = updatedColumns.find(col => col.id === "actions");
      if (actionsColumn && !actionsColumn.visible) {
        actionsColumn.visible = true;
      }
      
      console.log("Column visibility changed for:", columnId, "New state:", updatedColumns.find(c => c.id === columnId)?.visible);
      return updatedColumns;
    });
  };

  const handleSaveView = () => {
    if (savedViews.length >= 5) {
      toast.error("Limite máximo de 5 visualizações atingido");
      return;
    }
    
    const newView: View = {
      id: crypto.randomUUID(),
      name: `Visualização ${savedViews.length + 1}`,
      columns: [...columns],
    };
    
    setSavedViews(prev => [...prev, newView]);
    toast.success("Visualização salva com sucesso");
  };

  const handleLoadView = (view: View) => {
    setColumns(prev => 
      prev.map(col => {
        const viewCol = view.columns.find(vc => vc.id === col.id);
        return viewCol ? { ...col, visible: viewCol.visible } : col;
      })
    );
    toast.success(`Visualização "${view.name}" carregada`);
  };

  const handleColumnsChange = (newColumns: Column[]) => {
    setColumns(newColumns);
  };

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipe</h1>
        <ActionButtons
          columns={columns}
          savedViews={savedViews}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Novo Membro"
          data={teamMembers}
          exportFilename="equipe"
        />
      </div>

      <TeamList 
        teamMembers={teamMembers} 
        columns={columns}
        onColumnsChange={handleColumnsChange}
      />
    </div>
  );
}
