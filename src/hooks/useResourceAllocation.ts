
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  hourly_rate: number;
  daily_capacity: number;
  email?: string;
  status?: string;
}

export function useResourceAllocation() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('status', 'active')
          .order('position', { ascending: true })
          .order('first_name', { ascending: true });

        if (error) throw error;
        
        setTeamMembers(data || []);
      } catch (err) {
        console.error('Error loading team members:', err);
        setError(err instanceof Error ? err : new Error('Failed to load team members'));
        toast.error("Erro ao carregar membros da equipe");
      } finally {
        setLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  return { teamMembers, loading, error };
}
