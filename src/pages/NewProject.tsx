import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/Projects/ProjectForm";

export default function NewProject() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Cadastrar Projeto</h1>
      </div>
      <ProjectForm editingId={null} attributes={[]} onSubmit={() => {}} />
    </div>
  );
}