import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Attribute {
  id: string;
  name: string;
  unit: "hours" | "quantity" | "percentage";
  type: "number" | "list" | "text";
  defaultValue?: string;
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface AttributeListProps {
  attributes: Attribute[];
  columns: Column[];
  onEdit: (attribute: Attribute) => void;
  onDelete: (id: string) => void;
}

export function AttributeList({ attributes, columns, onEdit, onDelete }: AttributeListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Atributos Cadastrados</h2>
        <div className="space-y-4">
          {attributes.map((attribute) => (
            <div
              key={attribute.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                {columns.find(col => col.id === "name")?.visible && (
                  <h3 className="font-medium">{attribute.name}</h3>
                )}
                <p className="text-sm text-gray-500">
                  {columns.find(col => col.id === "type")?.visible && attribute.type}
                  {columns.find(col => col.id === "unit")?.visible && ` | ${attribute.unit}`}
                  {columns.find(col => col.id === "defaultValue")?.visible && 
                    attribute.defaultValue && ` | Padrão: ${attribute.defaultValue}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(attribute)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(attribute.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}