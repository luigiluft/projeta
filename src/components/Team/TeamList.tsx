
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface TeamMember {
  id: string;
  role: string;
  hourlyRate: number;
  name: string;
}

export function TeamList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const teamMembers: TeamMember[] = [
    { id: "1", role: "BK", hourlyRate: 78.75, name: "Leandro Pires" },
    { id: "2", role: "DS", hourlyRate: 48.13, name: "João Carlos" },
    { id: "3", role: "PMO", hourlyRate: 87.50, name: "Lucca Luft" },
    { id: "4", role: "PO", hourlyRate: 35.00, name: "Thiago Lobo" },
    { id: "5", role: "CS", hourlyRate: 48.13, name: "Yan Antunes" },
    { id: "6", role: "FRJ", hourlyRate: 70.00, name: "Rodolfo Rodrigues" },
    { id: "7", role: "FRP", hourlyRate: 119.00, name: "Davi Lobo" },
    { id: "8", role: "BKT", hourlyRate: 131.04, name: "Roger Takemiya" },
    { id: "9", role: "ATS", hourlyRate: 65.85, name: "Ariane Souza" },
  ];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeamMembers = teamMembers.slice(startIndex, endIndex);

  const totalPages = Math.ceil(teamMembers.length / itemsPerPage);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>HH</TableHead>
                <TableHead>Squad</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTeamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.role}</TableCell>
                  <TableCell>{formatCurrency(member.hourlyRate)}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
