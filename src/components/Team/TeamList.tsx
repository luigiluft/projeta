
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DraggableTable } from "@/components/ui/draggable-table";
import { Column } from "@/types/project";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  email: string;
  department: string;
  status: string;
  hourly_rate: number;
  squad?: string;
}

interface TeamListProps {
  teamMembers: TeamMember[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onDelete: (id: string) => void;
}

export function TeamList({ teamMembers, columns, onColumnsChange, onDelete }: TeamListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeamMembers = teamMembers.slice(startIndex, endIndex);

  const totalPages = Math.ceil(teamMembers.length / itemsPerPage);

  const handleEdit = (id: string) => {
    navigate(`/edit-team-member/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      onDelete(id);
    } catch (error) {
      console.error("Erro ao excluir membro:", error);
      toast.error("Erro ao excluir membro da equipe");
    }
  };

  const formatValue = (value: any, columnId: string, rowData?: any) => {
    if (columnId === "actions" && rowData) {
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(rowData.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(rowData.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    if (columnId === "name" && rowData) {
      return `${rowData.first_name} ${rowData.last_name}`;
    }
    
    if (columnId === "hourly_rate") {
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

  const visibleColumns = columns.filter(column => column.visible);
  
  console.log("TeamList received columns:", columns.map(c => `${c.id} (${c.visible ? 'visible' : 'hidden'})`));

  return (
    <div className="bg-white rounded-lg shadow dark:bg-slate-800">
      <div className="p-6">
        <div className="relative overflow-x-auto bg-white dark:bg-slate-800 rounded-lg">
          <DraggableTable
            columns={columns}
            onColumnsChange={onColumnsChange}
            data={paginatedTeamMembers}
            formatValue={formatValue}
          />
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
