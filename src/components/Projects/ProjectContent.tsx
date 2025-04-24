
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingTab } from "./PricingTab";
import { ImplementationTasksTab } from "./TaskTabs/ImplementationTasksTab";
import { SustainmentTasksTab } from "./TaskTabs/SustainmentTasksTab";
import { GanttTab } from "./TaskTabs/GanttTab";
import { Attribute, Task } from "@/types/project";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { ScopeTab } from "./ScopeTab";

interface ProjectContentProps {
  form: UseFormReturn<ProjectFormValues>;
  selectedTasks: Task[];
  taskColumns: any;
  handleColumnsChange: (columns: any) => void;
  attributeValues: Record<string, number>;
  attributes: Attribute[];
  editingId?: string | null;
  readOnly?: boolean;
}

export function ProjectContent({
  form,
  selectedTasks,
  taskColumns,
  handleColumnsChange,
  attributeValues,
  attributes,
  editingId,
  readOnly
}: ProjectContentProps) {
  // Extrair valores dos atributos do formulário e combinar com attributeValues
  const formValues = form.getValues();
  const combinedAttributes: Record<string, number> = {
    ...attributeValues
  };
  
  // Adicionar valores do formulário, convertendo para número quando possível
  attributes.forEach(attr => {
    const attrId = attr.id;
    if (formValues[attrId] !== undefined) {
      const value = Number(formValues[attrId]);
      if (!isNaN(value)) {
        combinedAttributes[attrId] = value;
      }
    }
  });

  console.log("ProjectContent - Valores combinados de atributos:", combinedAttributes);
  console.log("ProjectContent - Tarefas selecionadas:", selectedTasks.length);

  return (
    <Tabs defaultValue="pricing" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="pricing" className="flex-1">Precificação</TabsTrigger>
        <TabsTrigger value="implementation" className="flex-1">Implementação</TabsTrigger>
        <TabsTrigger value="sustainment" className="flex-1">Sustentação</TabsTrigger>
        <TabsTrigger value="gantt" className="flex-1">Gantt</TabsTrigger>
      </TabsList>

      <TabsContent value="pricing">
        <PricingTab form={form} attributes={attributes} readOnly={readOnly} />
      </TabsContent>

      <TabsContent value="implementation">
        <ImplementationTasksTab 
          tasks={selectedTasks} 
          columns={taskColumns}
          onColumnsChange={handleColumnsChange}
          attributeValues={combinedAttributes}
        />
      </TabsContent>

      <TabsContent value="sustainment">
        <SustainmentTasksTab 
          tasks={selectedTasks} 
          columns={taskColumns}
          onColumnsChange={handleColumnsChange}
          attributeValues={combinedAttributes}
        />
      </TabsContent>

      <TabsContent value="gantt">
        <GanttTab tasks={selectedTasks} />
      </TabsContent>
    </Tabs>
  );
}
