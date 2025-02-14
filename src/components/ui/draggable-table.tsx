
import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { DragOverlay, useDraggable } from "@dnd-kit/core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DraggableTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onReorder?: (startIndex: number, endIndex: number) => void;
  onColumnsChange?: (columns: ColumnDef<T>[]) => void;
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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { setNodeRef } = useDraggable({
    id: "table",
  });

  const handleReorder = (startIndex: number, endIndex: number) => {
    if (onReorder) {
      onReorder(startIndex, endIndex);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {table.getFlatHeaders().map((header) => (
              <TableHead key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody ref={setNodeRef}>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              draggable
              onDragStart={() => handleReorder(row.index, row.index)}
              onDragOver={(e) => {
                e.preventDefault();
                const target = e.target as HTMLElement;
                const targetRow = target.closest("tr");
                if (targetRow) {
                  const targetIndex = Array.from(
                    targetRow.parentElement?.children || []
                  ).indexOf(targetRow);
                  handleReorder(row.index, targetIndex);
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {formatValue 
                    ? formatValue(
                        cell.getValue(),
                        cell.column.id,
                        row.original
                      )
                    : flexRender(cell.column.columnDef.cell, cell.getContext())}
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
