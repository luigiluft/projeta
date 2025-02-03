import { Button } from "@/components/ui/button";
import { TeamList } from "@/components/Team/TeamList";
import { TeamForm } from "@/components/Team/TeamForm";
import { useState } from "react";
import { UserPlus } from "lucide-react";

export default function Team() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="mr-2" />
          Adicionar Colaborador
        </Button>
      </div>

      {showForm ? (
        <TeamForm onClose={() => setShowForm(false)} />
      ) : (
        <TeamList />
      )}
    </div>
  );
}