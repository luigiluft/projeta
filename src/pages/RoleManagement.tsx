import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function RoleManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_distinct_approved_roles');

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  const handleRoleClick = (role: AppRole) => {
    navigate(`/settings/roles/${role}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Gerenciamento de Funções</h1>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">
                Função
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {roles?.map((role) => (
              <tr key={role.role} className="border-b">
                <td className="p-4">{role.role}</td>
                <td className="p-4">
                  <Button onClick={() => handleRoleClick(role.role as AppRole)}>
                    Ver Permissões
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}