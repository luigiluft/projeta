
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DraggableTable } from "@/components/ui/draggable-table";
import { Column } from "@/types/project";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  status: "active" | "inactive";
  hourlyRate: number;
}

interface TeamListProps {
  teamMembers: TeamMember[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export function TeamList({ teamMembers, columns, onColumnsChange }: TeamListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeamMembers = teamMembers.slice(startIndex, endIndex);

  const totalPages = Math.ceil(teamMembers.length / itemsPerPage);

  const formatValue = (value: any, columnId: string, rowData?: any) => {
    if (columnId === "actions") {
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    if (columnId === "hourlyRate") {
      return value ? formatCurrency(value) : '-';
    }
    
    if (columnId === "status") {
      return value === "active" ? "Ativo" : "Inativo";
    }
    
    return value;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Filtramos as colunas visíveis para uso no DraggableTable
  const visibleColumns = columns.filter(column => column.visible);
  
  console.log("TeamList received columns:", columns.map(c => `${c.id} (${c.visible ? 'visible' : 'hidden'})`));

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="relative overflow-x-auto">
          <DraggableTable
            columns={columns}
            onColumnsChange={onColumnsChange}
            data={paginatedTeamMembers}
            formatValue={formatValue}
          />
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(endIndex, teamMembers.length)} de {teamMembers.length} membros
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
