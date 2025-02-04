import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PendingUser {
  id: string;
  role: string;
  created_at: string;
  user_id: string;
  email?: string;
}

export default function UserApproval() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: pendingUsers, refetch } = useQuery({
    queryKey: ["pending-users"],
    queryFn: async () => {
      // First get pending user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("approved", false);

      if (rolesError) throw rolesError;

      // Then fetch user emails for those roles
      const userIds = userRoles?.map(role => role.user_id) || [];
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (usersError) throw usersError;

      // Combine the data
      return userRoles?.map(role => ({
        ...role,
        email: users?.find(u => u.id === role.user_id)?.email
      })) as PendingUser[];
    },
  });

  const handleApprove = async (userId: string, roleId: string) => {
    try {
      setLoading(userId);
      const { error } = await supabase
        .from("user_roles")
        .update({ approved: true })
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Usuário aprovado com sucesso!",
        description: "O usuário agora pode acessar a plataforma.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao aprovar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Aprovação de Usuários</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleApprove(user.user_id, user.id)}
                    disabled={loading === user.user_id}
                  >
                    Aprovar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!pendingUsers?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum usuário pendente de aprovação
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}