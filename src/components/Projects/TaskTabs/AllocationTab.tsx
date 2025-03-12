
import { useState, useEffect } from "react";
import { Task } from "@/types/project";
import { useResourceAllocation } from "@/hooks/useResourceAllocation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AllocationTabProps {
  tasks: Task[];
  readOnly?: boolean;
}

interface RoleAllocation {
  role: string;
  tasks: Task[];
  totalHours: number;
  assignedMember?: string;
}

export function AllocationTab({ tasks, readOnly }: AllocationTabProps) {
  const [roleAllocations, setRoleAllocations] = useState<RoleAllocation[]>([]);
  const { teamMembers, loading } = useResourceAllocation();

  useEffect(() => {
    // Group tasks by role (owner)
    const roleGroups = tasks.reduce((groups: { [key: string]: Task[] }, task) => {
      const role = task.owner || 'Não atribuído';
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(task);
      return groups;
    }, {});

    // Calculate total hours for each role
    const allocations = Object.entries(roleGroups).map(([role, tasks]) => {
      const totalHours = tasks.reduce((sum, task) => {
        return sum + (task.calculated_hours || task.fixed_hours || 0);
      }, 0);

      return {
        role,
        tasks,
        totalHours,
        assignedMember: undefined
      };
    });

    setRoleAllocations(allocations);
  }, [tasks]);

  const availableTeamMembers = (role: string) => {
    return teamMembers?.filter(member => member.position === role) || [];
  };

  if (loading) {
    return <div>Carregando membros da equipe...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cargo</TableHead>
            <TableHead>Total de Tarefas</TableHead>
            <TableHead>Total de Horas</TableHead>
            <TableHead>Membro Alocado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roleAllocations.map((allocation) => (
            <TableRow key={allocation.role}>
              <TableCell>{allocation.role}</TableCell>
              <TableCell>{allocation.tasks.length}</TableCell>
              <TableCell>{allocation.totalHours.toFixed(2)}h</TableCell>
              <TableCell>
                <Select
                  disabled={readOnly}
                  value={allocation.assignedMember}
                  onValueChange={(value) => {
                    setRoleAllocations(currentAllocations =>
                      currentAllocations.map(current =>
                        current.role === allocation.role
                          ? { ...current, assignedMember: value }
                          : current
                      )
                    );
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecionar membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeamMembers(allocation.role).map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
