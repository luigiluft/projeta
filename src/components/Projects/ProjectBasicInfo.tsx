
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";

interface ProjectBasicInfoProps {
  form: UseFormReturn<ProjectFormValues>;
  readOnly?: boolean;
  hideDates?: boolean;
  estimatedEndDate?: string | null;
  selectedEpics?: string[];
  selectedTasks?: any[];
}

export function ProjectBasicInfo({ 
  form, 
  readOnly = false,
  hideDates = false, 
  estimatedEndDate,
  selectedEpics = [],
  selectedTasks = []
}: ProjectBasicInfoProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Projeto</FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite o nome do projeto" 
                {...field} 
                readOnly={readOnly}
                className={readOnly ? "bg-gray-50" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente</FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome do cliente" 
                {...field} 
                readOnly={readOnly}
                className={readOnly ? "bg-gray-50" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-1 md:col-span-2">
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva o projeto" 
                className={`min-h-[100px] ${readOnly ? "bg-gray-50" : ""}`}
                {...field} 
                readOnly={readOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
