
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
  form: UseFormReturn<ProjectFormValues>;
  readOnly?: boolean;
}

export function ProjectAttributeValueInput({ 
  attribute, 
  form,
  readOnly = false
}: ProjectAttributeValueInputProps) {
  const code = attribute.code || attribute.id;
  const value = form.getValues()[code];
  const [inputValue, setInputValue] = useState(value?.toString() || '0');

  useEffect(() => {
    const subscription = form.watch((values) => {
      const newValue = values[code];
      if (newValue !== undefined) {
        setInputValue(newValue.toString());
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Tentar converter para número
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue)) {
      form.setValue(code, numericValue);
    } else {
      form.setValue(code, newValue);
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
