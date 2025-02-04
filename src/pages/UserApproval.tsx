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
  first_name: string | null;
  last_name: string | null;
  role: string;
  approved: boolean;
  display_name: string | null;
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
    queryKey: ["pendingUsers", currentUserEmail],
    queryFn: async () => {
      if (!currentUserEmail) return [];

      // Get user roles and related profiles
      const { data: userRoles, error: userRolesError } = await supabase
        .from("user_roles")
        .select(`
          id,
          role,
          approved,
          user_id,
          profiles:user_id (
            first_name,
            last_name,
            id
          )
        `)
        .eq('supervisor_email', currentUserEmail);

      if (userRolesError) {
        console.error("Error fetching user roles:", userRolesError);
        throw userRolesError;
      }

      // Get auth users data for emails
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error("Error fetching auth users:", authError);
        return [];
      }

      return userRoles.map((role) => {
        const profile = role.profiles;
        const authUser = authData?.users?.find(u => u.id === role.user_id);
        
        return {
          id: role.id,
          email: authUser?.email || "Unknown",
          display_name: authUser?.user_metadata?.name || null,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          role: role.role,
          approved: role.approved,
        };
      });
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
                {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`}
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
          {(!pendingUsers || pendingUsers.length === 0) && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-4 text-gray-500"
              >
                Nenhum usuário pendente encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}