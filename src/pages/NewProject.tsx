import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/Projects/ProjectForm";
import { useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
  attributes: Record<string, string | number>;
}

const attributes = [
  // Business Metrics
  {
    id: "ordersPerMonth",
    name: "Pedidos/Mês",
    unit: "quantity",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "averageTicket",
    name: "Ticket Médio",
    unit: "quantity",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "skuCount",
    name: "Quantidade de SKUs",
    unit: "quantity",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "newProductsPercentage",
    name: "% Novos Produtos",
    unit: "percentage",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "registeredCustomers",
    name: "Número de Clientes Cadastrados",
    unit: "quantity",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "serviceChannels",
    name: "Canais de Atendimento",
    unit: "quantity",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "marketplaceChannels",
    name: "Número de Canais no Marketplace",
    unit: "quantity",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "customerServiceTime",
    name: "Tempo de Atendimento por Cliente (Min)",
    unit: "quantity",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "servicePercentage",
    name: "% Atendimento",
    unit: "percentage",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "returnsPercentage",
    name: "% Devoluções",
    unit: "percentage",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "productAttributes",
    name: "Atributos de Produto",
    unit: "quantity",
    type: "number",
    defaultValue: "0",
  },
  // Time Estimates (in hours)
  {
    id: "institutionalContentUpdate",
    name: "Atualização de Conteúdo Institucional",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "improvementsImplementation",
    name: "Implementação de Melhorias",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "configurationUpdate",
    name: "Atualização de Configuração",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "businessRulesUpdate",
    name: "Atualização de Regras de Negócio",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "promotionalRulesCreation",
    name: "Criação de Regras Promocionais",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "technicalSupport",
    name: "Suporte Técnico",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "ecommerceTraining",
    name: "Treinamento para o Ecommerce",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "serviceConfigUpdate",
    name: "Atualização de Configurações de Atendimento",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "frontendBugFixes",
    name: "Correção de Erros no Front",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "integrationBugFixes",
    name: "Correção de Erros de Integração",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
  {
    id: "bugMonitoring",
    name: "Monitoramento de Bugs",
    unit: "hours",
    type: "number",
    defaultValue: "0",
  },
];

export default function NewProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<Project | undefined>(undefined);

  useEffect(() => {
    if (id) {
      // In a real application, you would fetch the project data from your backend
      // For now, we'll simulate this with localStorage
      const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
      const foundProject = storedProjects.find((p: Project) => p.id === id);
      if (foundProject) {
        setProject(foundProject);
      }
    }
  }, [id]);

  const handleSubmit = (values: Project) => {
    // In a real application, you would send this to your backend
    // For now, we'll simulate this with localStorage
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    
    if (id) {
      const updatedProjects = storedProjects.map((p: Project) =>
        p.id === id ? values : p
      );
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
    } else {
      localStorage.setItem(
        "projects",
        JSON.stringify([...storedProjects, values])
      );
    }
    
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
        attributes={attributes}
        onSubmit={handleSubmit}
        initialValues={project}
      />
    </div>
  );
}