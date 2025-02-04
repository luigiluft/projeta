import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PendingUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  approved: boolean;
}

export default function UserApproval() {
  const { toast } = useToast();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserEmail(user?.email || null);
    };
    getCurrentUser();
  }, []);

  const { data: pendingUsers, isLoading, refetch } = useQuery({
    queryKey: ["pendingUsers"],
    queryFn: async () => {
      console.log("Fetching pending users...");
      const { data: userRoles, error: userRolesError } = await supabase
        .from("user_roles")
        .select(`
          id,
          role,
          approved,
          supervisor_email,
          user_id,
          profiles:profiles(first_name, last_name),
          users:auth.users(email)
        `)
        .eq('supervisor_email', currentUserEmail);

      if (userRolesError) {
        console.error("Error fetching user roles:", userRolesError);
        throw userRolesError;
      }

      return userRoles.map((userRole: any) => ({
        id: userRole.id,
        email: userRole.users?.email,
        first_name: userRole.profiles?.first_name,
        last_name: userRole.profiles?.last_name,
        role: userRole.role,
        approved: userRole.approved,
      }));
    },
    enabled: !!currentUserEmail,
  });

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ approved: true })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário aprovado com sucesso!",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar usuário: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Aprovação de Usuários</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingUsers?.map((user: PendingUser) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {user.approved ? "Aprovado" : "Pendente"}
              </TableCell>
              <TableCell>
                {!user.approved && (
                  <Button
                    onClick={() => handleApprove(user.id)}
                    size="sm"
                  >
                    Aprovar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}