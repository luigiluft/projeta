import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DraggableTable } from "@/components/ui/draggable-table";

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
  onColumnsChange: (columns: Column[]) => void;
}

export function AttributeList({
  attributes,
  columns,
  onEdit,
  onDelete,
  onColumnsChange,
}: AttributeListProps) {
  const formatValue = (value: any, columnId: string) => {
    if (columnId === "actions") {
      const attribute = attributes.find((attr) => attr.id === value);
      if (!attribute) return null;
      return (
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
      );
    }
    return value;
  };

  const attributesWithActions = attributes.map((attr) => ({
    ...attr,
    actions: attr.id,
  }));

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Atributos Cadastrados</h2>
        <div className="relative overflow-x-auto">
          <DraggableTable
            columns={[...columns, { id: "actions", label: "Ações", visible: true }]}
            onColumnsChange={onColumnsChange}
            data={attributesWithActions}
            formatValue={formatValue}
          />
        </div>
      </div>
    </div>
  );
}