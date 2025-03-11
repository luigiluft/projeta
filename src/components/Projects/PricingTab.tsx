
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Attribute } from "@/types/project";
import { useEffect } from "react";

interface PricingTabProps {
  form: UseFormReturn<any>;
  attributes: Attribute[];
  readOnly?: boolean;
}

export function PricingTab({ form, attributes, readOnly = false }: PricingTabProps) {
  // Garantir que os valores padrão sejam carregados quando os atributos mudarem
  useEffect(() => {
    // Para cada atributo, se não tiver um valor já definido no formulário,
    // definir o valor padrão
    attributes.forEach(attr => {
      const currentValue = form.getValues(attr.id);
      
      // Se não tiver valor e tiver um valor padrão, definir
      if ((currentValue === undefined || currentValue === "" || Number.isNaN(currentValue)) && attr.defaultValue) {
        const value = attr.type === "number" ? Number(attr.defaultValue) : attr.defaultValue;
        form.setValue(attr.id, value);
      }
    });
  }, [attributes, form]);

  return (
    <div className="space-y-4 mt-4">
      {attributes.map((attribute) => (
        <FormField
          key={attribute.id}
          control={form.control}
          name={attribute.id}
          render={({ field }) => {
            // Tratar valores inválidos (NaN, undefined) para exibição
            const displayValue = (() => {
              if (field.value === undefined || field.value === "") return "";
              
              // Se for um objeto com _type definido (casos especiais)
              if (field.value && typeof field.value === 'object' && field.value._type === 'Number') {
                return field.value.value === "NaN" ? "" : field.value.value;
              }
              
              // Se for NaN, retornar string vazia
              if (typeof field.value === 'number' && isNaN(field.value)) return "";
              
              return field.value;
            })();

            return (
              <FormItem>
                <FormLabel>{attribute.name}</FormLabel>
                <FormControl>
                  <Input
                    type={attribute.type === "number" ? "number" : "text"}
                    placeholder={`Digite ${attribute.name.toLowerCase()}`}
                    {...field}
                    value={displayValue}
                    onChange={(e) => {
                      if (!readOnly) {
                        const value = attribute.type === "number"
                          ? e.target.value === "" ? "" : Number(e.target.value)
                          : e.target.value;
                        field.onChange(value);
                      }
                    }}
                    readOnly={readOnly}
                    className={readOnly ? "bg-gray-50" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      ))}
    </div>
  );
}
