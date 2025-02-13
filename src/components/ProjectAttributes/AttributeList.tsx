
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DraggableTable } from "@/components/ui/draggable-table";
import { ProjectAttribute } from "@/types/database";
import { Column } from "@/types/project";

interface AttributeListProps {
  attributes: ProjectAttribute[];
  columns: Column[];
  onEdit: (attribute: ProjectAttribute) => void;
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
  const formatValue = (value: any, columnId: string, rowData: any) => {
    if (columnId === "actions") {
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(rowData)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(rowData.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (columnId === "value" && rowData.unit === "percentage") {
      return `${value}%`;
    }

    if (columnId === "value" && rowData.unit === "currency") {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(value));
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
