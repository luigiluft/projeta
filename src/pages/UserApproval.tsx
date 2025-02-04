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
import { Database } from "@/integrations/supabase/types";
import { Check, Pencil, Trash2 } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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

  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      // First check if current user is admin
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("id", (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      if (profileError) {
        console.error("Error checking user role:", profileError);
        throw profileError;
      }

      if (currentUserProfile?.role !== 'admin' || !currentUserProfile?.approved) {
        throw new Error("Unauthorized access");
      }

      // If admin, fetch all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      return profiles || [];
    },
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

  const handleEdit = async (userId: string) => {
    toast({
      title: "Info",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleDelete = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário: " + error.message,
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
            <TableHead>Função</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles?.map((user: Profile) => (
            <TableRow key={user.id}>
              <TableCell>
                {`${user.first_name || ''} ${user.last_name || ''}`}
              </TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.approved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.approved ? "Aprovado" : "Pendente"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {!user.approved && (
                    <Button
                      onClick={() => handleApprove(user.id)}
                      variant="ghost"
                      size="icon"
                      title="Aprovar"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEdit(user.id)}
                    variant="ghost"
                    size="icon"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(user.id)}
                    variant="ghost"
                    size="icon"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {(!profiles || profiles.length === 0) && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-4 text-gray-500"
              >
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}