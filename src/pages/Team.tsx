import { useState } from "react";
import { TeamList } from "@/components/Team/TeamList";
import { TeamForm } from "@/components/Team/TeamForm";
import { ActionButtons } from "@/components/ProjectAttributes/ActionButtons";

export default function Team() {
  const [showForm, setShowForm] = useState(false);
  const [columns, setColumns] = useState([]);
  const [savedViews, setSavedViews] = useState([]);

  const handleImportSpreadsheet = () => {
    console.log("Import spreadsheet clicked");
  };

  const handleNewMember = () => {
    setShowForm(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time</h1>
        <ActionButtons
          columns={columns}
          savedViews={savedViews}
          onNewAttribute={handleNewMember}
          onImportSpreadsheet={handleImportSpreadsheet}
          newButtonText="Novo Colaborador"
        />
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TeamForm onClose={() => setShowForm(false)} />
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