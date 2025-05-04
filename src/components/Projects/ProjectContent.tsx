
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
    if (formValues[attrId] !== undefined && formValues[attrId] !== null && formValues[attrId] !== '') {
      let value: number;
      
      if (typeof formValues[attrId] === 'object' && formValues[attrId] !== null && 'value' in formValues[attrId]) {
        // Se for um objeto com uma propriedade value
        value = Number(formValues[attrId].value);
      } else {
        // Se for um valor primitivo
        value = Number(formValues[attrId]);
      }
      
      if (!isNaN(value)) {
        combinedAttributes[attrId] = value;
      }
    }
  });

  // Garantir que campos especiais sempre estejam definidos
  const specialFields = ['tempo_de_atendimento_por_cliente', 'pedidos_mes', 'ticket_medio', 'CUSTOMER_SERVICE_TIME', 'ORDERS_PER_MONTH', 'AVERAGE_TICKET'];
  
  specialFields.forEach(field => {
    if (combinedAttributes[field] === undefined) {
      combinedAttributes[field] = 0;
    }
  });

  console.log("ProjectContent - Valores combinados de atributos:", {
    attrValuesKeys: Object.keys(attributeValues || {}),
    formValuesKeys: Object.keys(formValues).filter(k => attributes.some(attr => attr.id === k)),
    combinedKeys: Object.keys(combinedAttributes),
    combinedValues: Object.entries(combinedAttributes).map(([k,v]) => `${k}: ${v}`).join(', '),
    selectedTasksCount: selectedTasks.length
  });

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
