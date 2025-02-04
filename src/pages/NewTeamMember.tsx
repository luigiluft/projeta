import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamForm } from "@/components/Team/TeamForm";

export default function NewTeamMember() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/team")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Cadastrar Membro</h1>
      </div>
      <TeamForm onClose={() => navigate("/team")} />
    </div>
  );
}