
import React from "react";
import { DragOverlay, useDraggable } from "@dnd-kit/core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Column } from "@/types/project";

interface DraggableTableProps<T> {
  data: T[];
  columns: Column[];
  onReorder?: (startIndex: number, endIndex: number) => void;
  onColumnsChange?: (columns: Column[]) => void;
  itemsPerPage?: number;
  setItemsPerPage?: (value: number) => void;
  formatValue?: (value: any, columnId: string, rowData?: T) => React.ReactNode;
}

export function DraggableTable<T>({
  data,
  columns,
  onReorder,
  onColumnsChange,
  itemsPerPage,
  setItemsPerPage,
  formatValue,
}: DraggableTableProps<T>) {
  const { setNodeRef } = useDraggable({
    id: "table",
  });

  const handleReorder = (startIndex: number, endIndex: number) => {
    if (onReorder) {
      onReorder(startIndex, endIndex);
    }
  };

  // Filtrar apenas colunas visíveis para exibição
  const visibleColumns = columns.filter(col => col.visible);
  
  console.log("Visible columns in table:", visibleColumns.map(c => c.id));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead key={column.id}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody ref={setNodeRef}>
          {data.map((row: any, rowIndex) => (
            <TableRow
              key={row.id}
              draggable
              onDragStart={() => handleReorder(rowIndex, rowIndex)}
              onDragOver={(e) => {
                e.preventDefault();
                const target = e.target as HTMLElement;
                const targetRow = target.closest("tr");
                if (targetRow) {
                  const targetIndex = Array.from(
                    targetRow.parentElement?.children || []
                  ).indexOf(targetRow);
                  handleReorder(rowIndex, targetIndex);
                }
              }}
            >
              {visibleColumns.map((column) => (
                <TableCell key={column.id}>
                  {formatValue 
                    ? formatValue(row[column.id], column.id, row)
                    : row[column.id]?.toString() || ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DragOverlay>
        {itemsPerPage && (
          <div className="p-2">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage?.(Number(e.target.value))}
              className="border p-1 rounded"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        )}
      </DragOverlay>
    </div>
  );
}
