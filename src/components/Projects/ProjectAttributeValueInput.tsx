
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/utils/projectFormSchema";

interface ProjectAttributeValueInputProps {
  attribute: {
    id: string;
    name: string;
    code?: string | null;
    unit: string;
    description?: string;
    default_value?: string;
  };
  form?: UseFormReturn<ProjectFormValues>;
  readOnly?: boolean;
  value?: number;
  onChange?: (code: string, value: number) => void;
}

export function ProjectAttributeValueInput({ 
  attribute, 
  form,
  readOnly = false,
  value: externalValue,
  onChange
}: ProjectAttributeValueInputProps) {
  const code = attribute.code || attribute.id;
  
  // Inicializar o valor do input de acordo com a fonte (form ou props)
  const initialValue = 
    form ? (form.getValues()[code as keyof ProjectFormValues]?.toString() || '0') :
    externalValue !== undefined ? externalValue.toString() : '0';
  
  const [inputValue, setInputValue] = useState(initialValue);

  // Efeito para sincronizar com o formulário se estiver presente
  useEffect(() => {
    if (form) {
      const subscription = form.watch((values) => {
        const newValue = values[code as keyof ProjectFormValues];
        if (newValue !== undefined) {
          setInputValue(newValue.toString());
        }
      });
      
      return () => subscription.unsubscribe();
    } else if (externalValue !== undefined) {
      // Sincronizar com props quando não estiver usando formulário
      setInputValue(externalValue.toString());
    }
  }, [form, code, externalValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Tentar converter para número
    const numericValue = parseFloat(newValue);
    
    if (!isNaN(numericValue)) {
      if (form) {
        // Se temos um formulário, usamos setValue
        form.setValue(code as keyof ProjectFormValues, numericValue);
      } else if (onChange) {
        // Caso contrário, usamos a função onChange
        onChange(code, numericValue);
      }
    } else {
      if (form) {
        form.setValue(code as keyof ProjectFormValues, newValue);
      }
    }
  };

  // Formatar a unidade para exibição
  const formatUnit = (unit?: string) => {
    switch (unit) {
      case 'hours': return 'horas';
      case 'quantity': return 'qtd';
      case 'percentage': return '%';
      case 'currency': return 'R$';
      default: return '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={`attr-${code}`} className="text-sm font-medium">
          {attribute.name}
        </Label>
        {attribute.unit && (
          <span className="text-xs text-gray-500">{formatUnit(attribute.unit)}</span>
        )}
      </div>
      
      {attribute.description && (
        <p className="text-xs text-gray-500">{attribute.description}</p>
      )}
      
      <Input
        id={`attr-${code}`}
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        className="w-full"
        min="0"
        step="0.01"
        disabled={readOnly}
        readOnly={readOnly}
      />
      
      <div className="text-xs text-gray-400">
        Código: {code}
      </div>
    </div>
  );
}
