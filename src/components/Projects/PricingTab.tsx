
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

  // Log para debug
  console.log("Valores atuais no formulário:", form.getValues());
  console.log("Atributos recebidos:", attributes);
  
  return (
    <div className="space-y-4 mt-4">
      {attributes.map((attribute) => (
        <FormField
          key={attribute.id}
          control={form.control}
          name={attribute.id}
          render={({ field }) => {
            // Log para debug deste campo específico
            console.log(`Campo ${attribute.id} valor:`, field.value);
            
            // Tratar valores inválidos (NaN, undefined) para exibição
            let displayValue = "";
            
            if (field.value !== undefined && field.value !== "" && field.value !== null) {
              // Se for um objeto com _type definido (casos especiais)
              if (field.value && typeof field.value === 'object' && '_type' in field.value) {
                displayValue = field.value.value === "NaN" ? "" : String(field.value.value);
              } 
              // Se for um objeto de outro tipo
              else if (field.value && typeof field.value === 'object') {
                if ('value' in field.value) {
                  displayValue = field.value.value === "NaN" ? "" : String(field.value.value);
                }
              } 
              // Para valores primitivos
              else {
                displayValue = typeof field.value === 'number' && isNaN(field.value) ? "" : String(field.value);
              }
            }

            // Verificar se é um campo especial
            const isSpecialField = ['tempo_de_atendimento_por_cliente', 'pedidos_mes', 'ticket_medio'].includes(attribute.id);
            
            // Destacar campo de ticket_medio com uma borda diferente
            const isTicketMedio = attribute.id === 'ticket_medio';

            return (
              <FormItem>
                <FormLabel>{attribute.name}</FormLabel>
                <FormControl>
                  <Input
                    type={attribute.type === "number" ? "number" : "text"}
                    placeholder={`Digite ${attribute.name.toLowerCase()}`}
                    value={displayValue}
                    onChange={(e) => {
                      if (!readOnly) {
                        const inputValue = e.target.value;
                        let value: string | number = inputValue;
                        
                        // Converter para número se o campo for numérico
                        if (attribute.type === "number" && inputValue !== "") {
                          value = parseFloat(inputValue);
                          if (isNaN(value)) {
                            value = 0;
                          }
                        }
                        
                        // Log para debug ao alterar o valor
                        if (isSpecialField) {
                          console.log(`Alterando campo especial ${attribute.id} para:`, value);
                        }
                        
                        field.onChange(value);
                      }
                    }}
                    readOnly={readOnly}
                    className={`
                      ${readOnly ? "bg-gray-50" : ""} 
                      ${isSpecialField ? "border-primary focus:ring-2 focus:ring-primary" : ""}
                      ${isTicketMedio ? "border-2 border-green-500 focus:ring-2 focus:ring-green-500" : ""}
                    `}
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
