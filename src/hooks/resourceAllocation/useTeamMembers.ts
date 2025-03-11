
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "./types";

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) {
        console.error("Erro ao carregar membros da equipe:", error);
        throw error;
      }

      return data as TeamMember[];
    },
  });
}
