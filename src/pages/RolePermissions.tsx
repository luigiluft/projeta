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
  enabled: boolean;
}

export default function RolePermissions() {
  const { role } = useParams<{ role: AppRole }>();
  const { toast } = useToast();

  const { data: permissions, refetch } = useQuery({
    queryKey: ["permissions", role],
    queryFn: async () => {
      if (!role) throw new Error("Role is required");

      // Get all permissions
      const { data: allPermissions, error: permissionsError } = await supabase
        .from("permissions")
        .select("*")
        .order("module");

      if (permissionsError) throw permissionsError;

      // Get profiles with this role that are approved
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", role)
        .eq("approved", true);

      if (profilesError) throw profilesError;

      // Get permissions for this role
      const { data: rolePermissions, error: rolePermissionsError } = await supabase
        .from("permissions")
        .select("id")
        .eq("role", role);

      if (rolePermissionsError) throw rolePermissionsError;

      const rolePermissionIds = rolePermissions?.map((rp) => rp.id) || [];

      // Combine the data
      return allPermissions?.map((permission) => ({
        ...permission,
        enabled: rolePermissionIds.includes(permission.id),
      })) || [];
    },
  });

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    if (!role) return;

    try {
      if (enabled) {
        // Add permission
        const { error } = await supabase
          .from("permissions")
          .update({ role })
          .eq("id", permissionId);

        if (error) throw error;
      } else {
        // Remove permission
        const { error } = await supabase
          .from("permissions")
          .update({ role: null })
          .eq("id", permissionId);

        if (error) throw error;
      }

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
                    checked={permission.enabled}
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