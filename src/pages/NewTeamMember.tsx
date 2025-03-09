
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamForm } from "@/components/Team/TeamForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewTeamMember() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/team")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Cadastrar Membro da Equipe</h1>
      </div>
      
      <Card className="bg-white dark:bg-slate-800 shadow-md">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl">Informações do Membro</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <TeamForm onClose={() => navigate("/team")} />
        </CardContent>
      </Card>
    </div>
  );
}
