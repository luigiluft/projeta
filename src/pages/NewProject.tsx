import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { useProjectForm } from "@/hooks/useProjectForm";
import { PROJECT_ATTRIBUTES } from "@/constants/projectAttributes";

export default function NewProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { project, handleSubmit } = useProjectForm(id);

  const handleFormSubmit = (values: any) => {
    handleSubmit(values);
    navigate("/projects");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? "Editar Projeto" : "Cadastrar Projeto"}
        </h1>
      </div>
      <ProjectForm
        editingId={id || null}
        attributes={PROJECT_ATTRIBUTES}
        onSubmit={handleFormSubmit}
        initialValues={project}
      />
    </div>
  );
}