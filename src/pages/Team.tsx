import { useState } from "react";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";
import { TeamList } from "@/components/Team/TeamList";

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
  const [savedViews, setSavedViews] = useState<any[]>([]); // Adjust type as necessary
  const [columns, setColumns] = useState<any[]>([ // Adjust type as necessary
    { id: "name", label: "Nome", visible: true },
    { id: "role", label: "Cargo", visible: true },
    { id: "email", label: "Email", visible: true },
    { id: "department", label: "Departamento", visible: true },
    { id: "status", label: "Status", visible: true },
  ]);

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSaveView = () => {
    console.log("Save view clicked");
  };

  const handleLoadView = (view: any) => {
    console.log("Load view clicked", view);
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

      <TeamList />
    </div>
  );
}