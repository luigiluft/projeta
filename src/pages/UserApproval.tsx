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

      // First, get the user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from("user_roles")
        .select("id, role, approved, supervisor_email, user_id")
        .eq('supervisor_email', currentUserEmail);

      if (userRolesError) {
        console.error("Error fetching user roles:", userRolesError);
        throw userRolesError;
      }

      // Then, get the profiles and auth data for these users
      const usersWithProfiles = await Promise.all(
        userRoles.map(async (role) => {
          // Get profile data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', role.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }

          // Get auth user data
          const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
            filters: {
              id: `eq.${role.user_id}`
            }
          });

          if (authError) {
            console.error("Error fetching auth user:", authError);
          }

          const authUser = users?.[0];

          return {
            id: role.id,
            email: authUser?.email || "Unknown",
            display_name: authUser?.user_metadata?.name || null,
            first_name: profile?.first_name || null,
            last_name: profile?.last_name || null,
            role: role.role,
            approved: role.approved,
          };
        })
      );

      return usersWithProfiles;
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