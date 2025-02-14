
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Attribute } from "@/types/project";

interface PricingTabProps {
  form: UseFormReturn<any>;
  attributes: Attribute[];
}

export function PricingTab({ form, attributes }: PricingTabProps) {
  return (
    <div className="space-y-4 mt-4">
      {attributes.map((attribute) => (
        <FormField
          key={attribute.id}
          control={form.control}
          name={attribute.id}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{attribute.name}</FormLabel>
              <FormControl>
                <Input
                  type={attribute.type === "number" ? "number" : "text"}
                  placeholder={`Digite ${attribute.name.toLowerCase()}`}
                  {...field}
                  onChange={(e) => {
                    const value = attribute.type === "number"
                      ? e.target.value === "" ? "" : Number(e.target.value)
                      : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
