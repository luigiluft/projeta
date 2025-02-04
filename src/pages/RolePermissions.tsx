import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

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

      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role", role as AppRole)
        .single();

      if (roleError) throw roleError;

      // Get role permissions
      const { data: rolePermissions, error: rolePermissionsError } = await supabase
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", roleData.id);

      if (rolePermissionsError) throw rolePermissionsError;

      const rolePermissionIds = rolePermissions.map((rp) => rp.permission_id);

      // Combine the data
      return allPermissions.map((permission) => ({
        ...permission,
        enabled: rolePermissionIds.includes(permission.id),
      }));
    },
  });

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    if (!role) return;

    try {
      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role", role as AppRole)
        .single();

      if (roleError) throw roleError;

      if (enabled) {
        // Add permission
        const { error } = await supabase
          .from("role_permissions")
          .insert({
            role_id: roleData.id,
            permission_id: permissionId,
          });

        if (error) throw error;
      } else {
        // Remove permission
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", roleData.id)
          .eq("permission_id", permissionId);

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