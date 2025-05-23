import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  enabled: boolean | null;
}

export default function RolePermissions() {
  const { role } = useParams<{ role: AppRole }>();
  const { toast } = useToast();

  const { data: permissions, refetch } = useQuery({
    queryKey: ["permissions", role],
    queryFn: async () => {
      if (!role) throw new Error("Role is required");

      const { data: allPermissions, error } = await supabase
        .from("permissions")
        .select("*")
        .order("module");

      if (error) throw error;

      return allPermissions || [];
    },
  });

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    if (!role) return;

    try {
      const { error } = await supabase
        .from("permissions")
        .update({ enabled })
        .eq("id", permissionId);

      if (error) throw error;

      toast({
        title: "Permissão atualizada",
        description: `A permissão foi ${enabled ? "adicionada" : "removida"} com sucesso.`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Permissões da Função: {role}</h1>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">
                Módulo
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Permissão
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Descrição
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions?.map((permission) => (
              <tr key={permission.id} className="border-b">
                <td className="p-4">{permission.module}</td>
                <td className="p-4">{permission.name}</td>
                <td className="p-4">{permission.description}</td>
                <td className="p-4">
                  <Checkbox
                    checked={permission.enabled || false}
                    onCheckedChange={(checked) =>
                      handlePermissionToggle(permission.id, checked as boolean)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}