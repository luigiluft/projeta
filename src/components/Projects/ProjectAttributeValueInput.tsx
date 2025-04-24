
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
    default_value?: string | number;  // Updated to accept both string and number
  };
  form?: UseFormReturn<ProjectFormValues>;
  readOnly?: boolean;
  value?: number | string;  // Allow both types for external value
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
  
  // Ensure initial value is always a string
  const initialValue = 
    form ? 
      (form.getValues()[code as keyof ProjectFormValues]?.toString() || '0') :
    externalValue !== undefined ? 
      String(externalValue) : '0';
  
  const [inputValue, setInputValue] = useState(initialValue);

  // Effect to synchronize with form or external value
  useEffect(() => {
    if (form) {
      const subscription = form.watch((values) => {
        const newValue = values[code as keyof ProjectFormValues];
        if (newValue !== undefined) {
          // Convert to string, handling both string and number cases
          setInputValue(String(newValue));
        }
      });
      
      return () => subscription.unsubscribe();
    } else if (externalValue !== undefined) {
      // Synchronize with props when not using form
      setInputValue(String(externalValue));
    }
  }, [form, code, externalValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Try to convert to number
    const numericValue = parseFloat(newValue);
    
    if (!isNaN(numericValue)) {
      if (form) {
        // If we have a form, use setValue
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

  // Format the unit for display
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

