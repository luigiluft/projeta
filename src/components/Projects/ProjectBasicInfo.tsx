
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";

interface ProjectBasicInfoProps {
  form: UseFormReturn<ProjectFormValues>;
  readOnly?: boolean;
  estimatedEndDate?: string | null;
}

export function ProjectBasicInfo({ form, readOnly = false, estimatedEndDate }: ProjectBasicInfoProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Início</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  readOnly={readOnly}
                  className={readOnly ? "bg-gray-50" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormItem>
            <FormLabel>Data Estimada de Término</FormLabel>
            <div className="flex items-center h-10 px-3 border rounded-md bg-muted/30">
              {estimatedEndDate ? (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{estimatedEndDate}</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">
                  Selecione Epics e tarefas para calcular
                </span>
              )}
            </div>
            <FormMessage />
          </FormItem>
        </div>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
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
