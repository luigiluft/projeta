import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface DraggableTableProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  data: any[];
  formatValue?: (value: any, columnId: string) => React.ReactNode;
  itemsPerPage?: number;
}

const DraggableTableHeader = ({ column }: { column: Column }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <TableHead ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {column.label}
    </TableHead>
  );
};

export function DraggableTable({
  columns,
  onColumnsChange,
  data,
  formatValue = (value) => value,
  itemsPerPage = 5,
}: DraggableTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const visibleColumns = columns.filter((col) => col.visible);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      onColumnsChange(newColumns);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleColumns.map((col) => col.id)}
                strategy={horizontalListSortingStrategy}
              >
                {visibleColumns.map((column) => (
                  <DraggableTableHeader key={column.id} column={column} />
                ))}
              </SortableContext>
            </DndContext>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item, index) => (
            <TableRow key={index}>
              {visibleColumns.map((column) => (
                <TableCell key={`${index}-${column.id}`}>
                  {formatValue(item[column.id], column.id)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {paginatedData.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length}
                className="text-center py-4 text-gray-500"
              >
                Nenhum item encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}