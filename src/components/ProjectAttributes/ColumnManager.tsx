
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnManagerProps {
  columns: Column[];
  onColumnVisibilityChange: (columnId: string) => void;
}

export function ColumnManager({ columns, onColumnVisibilityChange }: ColumnManagerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-0 bg-white dark:bg-slate-800 shadow-md border border-gray-200 dark:border-gray-700 z-50">
        <div className="p-2 grid gap-1.5 max-h-80 overflow-y-auto">
          {columns.map((column) => (
            <div key={column.id} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm">
              <Checkbox 
                id={`column-${column.id}`}
                checked={column.visible}
                onCheckedChange={() => onColumnVisibilityChange(column.id)}
              />
              <label 
                htmlFor={`column-${column.id}`}
                className="text-sm font-medium cursor-pointer flex-grow"
              >
                {column.label}
              </label>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
