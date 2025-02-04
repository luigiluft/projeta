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
  email: string | null;
  first_name: string | null;
  last_name: string | null;
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
    queryKey: ["pendingUsers", currentUserEmail],
    queryFn: async () => {
      if (!currentUserEmail) return [];

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq('supervisor_email', currentUserEmail)
        .eq('approved', false);

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      // Get auth users data for emails
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error("Error fetching auth users:", authError);
        return profiles || [];
      }

      // Combine the data
      return profiles?.map((profile) => {
        const authUser = users?.find(u => u.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || null,
        };
      }) || [];
    },
    enabled: !!currentUserEmail,
  });

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
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
                {`${user.first_name || ''} ${user.last_name || ''}`}
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