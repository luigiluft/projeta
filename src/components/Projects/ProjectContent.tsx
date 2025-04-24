
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, Column, Attribute } from "@/types/project";
import { ScopeTab } from "./ScopeTab";
import { PricingTab } from "./PricingTab";
import { GanttTab } from "./TaskTabs/GanttTab";
import { UseFormReturn } from "react-hook-form";
import { ProjectAttributeValueInput } from "./ProjectAttributeValueInput";
import { ProjectFormValues } from "@/utils/projectFormSchema";

interface ProjectContentProps {
  form: UseFormReturn<ProjectFormValues>;
  selectedTasks: Task[];
  taskColumns: Column[];
  handleColumnsChange: (columns: Column[]) => void;
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
  readOnly = false
}: ProjectContentProps) {
  const [activeTab, setActiveTab] = useState("scope");
  const [currentAttributeValues, setCurrentAttributeValues] = useState<Record<string, number>>(attributeValues || {});

  // Atualizar os valores dos atributos quando o formulário mudar
  useEffect(() => {
    const subscription = form.watch((value) => {
      const numericAttributes: Record<string, number> = {};
      
      // Filtrar apenas atributos numéricos
      attributes
        .filter(attr => attr.type === 'number')
        .forEach(attr => {
          const value = form.getValues()[attr.id];
          numericAttributes[attr.id] = typeof value === 'number' ? value : parseFloat(value as string) || 0;
        });
      
      setCurrentAttributeValues(numericAttributes);
    });

    // Inicializar com os valores atuais
    const initialValues: Record<string, number> = {};
    attributes
      .filter(attr => attr.type === 'number')
      .forEach(attr => {
        const value = form.getValues()[attr.id];
        initialValues[attr.id] = typeof value === 'number' ? value : parseFloat(value as string) || 0;
      });
    
    setCurrentAttributeValues(initialValues);
    
    return () => subscription.unsubscribe();
  }, [form, attributes]);

  return (
    <div className="space-y-6">
      {attributes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Atributos do Projeto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attributes.map((attribute) => (
              <ProjectAttributeValueInput
                key={attribute.id}
                attribute={{
                  ...attribute,
                  code: attribute.id // Garantir que código está sempre presente
                }}
                form={form}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Tabs defaultValue="scope" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="scope">Escopo</TabsTrigger>
            <TabsTrigger value="gantt">Gantt</TabsTrigger>
            <TabsTrigger value="pricing">Precificação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scope" className="space-y-6">
            <ScopeTab 
              tasks={selectedTasks} 
              columns={taskColumns}
              onColumnsChange={handleColumnsChange}
              attributeValues={currentAttributeValues}
            />
          </TabsContent>
          
          <TabsContent value="gantt">
            <GanttTab 
              tasks={selectedTasks}
              columns={taskColumns}
              onColumnsChange={handleColumnsChange}
              attributeValues={currentAttributeValues}
            />
          </TabsContent>
          
          <TabsContent value="pricing">
            <PricingTab 
              columns={taskColumns}
              onColumnsChange={handleColumnsChange}
              tasks={selectedTasks} 
              attributeValues={currentAttributeValues}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
