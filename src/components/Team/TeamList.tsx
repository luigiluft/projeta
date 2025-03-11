
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Column } from "@/types/project";

export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  hourly_rate: number;
  daily_capacity: number;
  email: string | null;
  department: string | null;
  status: string | null;
  squad: string | null;
}

interface TeamListProps {
  teamMembers: TeamMember[];
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onDelete: (id: string) => Promise<void>;
}

export function TeamList({ teamMembers, columns, onColumnsChange, onDelete }: TeamListProps) {
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/team/edit/${id}`);
  };

  const confirmDelete = (id: string) => {
    setDeletingMemberId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deletingMemberId) {
      await onDelete(deletingMemberId);
      setDeletingMemberId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingMemberId(null);
  };

  const visibleColumns = columns.filter(col => col.visible);

  const getStatusBadge = (status: string | null) => {
    if (status === "active") {
      return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
    } else if (status === "inactive") {
      return <Badge variant="secondary" className="bg-gray-400 hover:bg-gray-500">Inativo</Badge>;
    }
    return null;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map(col => (
              <TableHead key={col.id} className={col.id === "actions" ? "w-[80px]" : ""}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-muted-foreground">
                Nenhum membro da equipe encontrado
              </TableCell>
            </TableRow>
          ) : (
            teamMembers.map(member => (
              <TableRow key={member.id}>
                {visibleColumns.map(col => {
                  if (col.id === "name") {
                    return (
                      <TableCell key={col.id}>
                        {member.first_name} {member.last_name}
                      </TableCell>
                    );
                  } else if (col.id === "position") {
                    return <TableCell key={col.id}>{member.position}</TableCell>;
                  } else if (col.id === "email") {
                    return <TableCell key={col.id}>{member.email}</TableCell>;
                  } else if (col.id === "department") {
                    return <TableCell key={col.id}>{member.department}</TableCell>;
                  } else if (col.id === "status") {
                    return <TableCell key={col.id}>{getStatusBadge(member.status)}</TableCell>;
                  } else if (col.id === "hourly_rate") {
                    return <TableCell key={col.id}>R$ {member.hourly_rate.toFixed(2)}</TableCell>;
                  } else if (col.id === "daily_capacity") {
                    return <TableCell key={col.id}>{member.daily_capacity} h/dia</TableCell>;
                  } else if (col.id === "actions") {
                    return (
                      <TableCell key={col.id} className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(member.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmDelete(member.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    );
                  }
                  return null;
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deletingMemberId} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este membro da equipe? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
