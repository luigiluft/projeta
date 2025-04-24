
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
  
  // Campos especiais para verificar com mais detalhes
  const specialFields = ['tempo_de_atendimento_por_cliente', 'pedidos_mes', 'ticket_medio'];
  specialFields.forEach(field => {
    console.log(`Verificando campo especial ${field}:`, form.getValues(field));
  });

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
            const displayValue = (() => {
              // Verificar se é um dos campos específicos
              const isSpecialField = specialFields.includes(attribute.id);
              
              if (isSpecialField) {
                console.log(`Campo especial ${attribute.id}:`, field.value);
              }
              
              if (field.value === undefined || field.value === "") return "";
              
              // Se for um objeto com _type definido (casos especiais)
              if (field.value && typeof field.value === 'object' && '_type' in field.value && field.value._type === 'Number') {
                return field.value.value === "NaN" ? "" : field.value.value;
              }
              
              // Se for NaN, retornar string vazia
              if (typeof field.value === 'number' && isNaN(field.value)) return "";

              // Se for um objeto de outro tipo, tente convertê-lo para string ou número
              if (field.value && typeof field.value === 'object') {
                if ('value' in field.value) {
                  return field.value.value === "NaN" ? "" : field.value.value;
                }
                return "";
              }
              
              return field.value;
            })();

            // Verificar se é um dos campos específicos que precisamos tratar com destaque
            const isSpecialField = specialFields.includes(attribute.id);
            
            // Destacar campo de ticket_medio com uma borda diferente
            const isTicketMedio = attribute.id === 'ticket_medio';

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
