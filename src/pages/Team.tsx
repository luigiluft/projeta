import { useState } from "react";
import { TeamList } from "@/components/Team/TeamList";
import { TeamForm } from "@/components/Team/TeamForm";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";

interface View {
  id: string;
  name: string;
  columns: string[];
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

export default function Team() {
  const [showForm, setShowForm] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Nome", visible: true },
    { id: "role", label: "Cargo", visible: true },
    { id: "department", label: "Departamento", visible: true },
  ]);
  const [savedViews, setSavedViews] = useState<View[]>([]);

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  const handleNewMember = () => {
    setShowForm(true);
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSaveView = () => {
    console.log("Save view clicked");
  };

  const handleLoadView = (view: View) => {
    console.log("Load view clicked", view);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time</h1>
        <ActionButtons
          columns={columns}
          savedViews={savedViews}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onNewAttribute={handleNewMember}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Novo Colaborador"
        />
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TeamForm open={showForm} onOpenChange={setShowForm} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TeamList />
          </div>
        </div>
      )}
    </div>
  );
}