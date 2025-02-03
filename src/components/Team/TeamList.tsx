import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  status: "active" | "inactive";
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "João Silva",
    role: "Desenvolvedor Frontend",
    email: "joao@exemplo.com",
    department: "Tecnologia",
    status: "active",
  },
  {
    id: "2",
    name: "Maria Santos",
    role: "Product Manager",
    email: "maria@exemplo.com",
    department: "Produto",
    status: "active",
  },
];

export function TeamList() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTeamMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.department}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {member.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}