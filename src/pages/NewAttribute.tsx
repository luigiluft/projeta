import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AttributeForm } from "@/components/ProjectAttributes/AttributeForm";
import { toast } from "sonner";

export default function NewAttribute() {
  const navigate = useNavigate();

  const handleSubmit = (values: any) => {
    console.log(values);
    toast.success("Atributo criado com sucesso!");
    navigate("/project-attributes");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/project-attributes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Cadastrar Atributo</h1>
        </div>
      </div>
      <AttributeForm editingId={null} onSubmit={handleSubmit} />
    </div>
  );
}