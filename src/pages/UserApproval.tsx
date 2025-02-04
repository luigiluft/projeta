import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UserApproval() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: pendingUsers, refetch } = useQuery({
    queryKey: ["pending-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          role,
          created_at,
          user:user_id (
            id,
            email
          )
        `)
        .eq("approved", false);

      if (error) throw error;
      return data;
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
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">
                Email
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Função
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Data de Cadastro
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers?.map((user: any) => (
              <tr key={user.id} className="border-b">
                <td className="p-4">{user.user.email}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <Button
                    onClick={() => handleApprove(user.user.id, user.id)}
                    disabled={loading === user.user.id}
                  >
                    Aprovar
                  </Button>
                </td>
              </tr>
            ))}
            {!pendingUsers?.length && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  Nenhum usuário pendente de aprovação
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}