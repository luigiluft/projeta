
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Allocation } from "./types";

export function useAllocationMutations() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const createAllocation = useMutation({
    mutationFn: async (allocation: Allocation) => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('project_allocations')
          .insert({
            project_id: allocation.project_id,
            member_id: allocation.member_id,
            task_id: allocation.task_id,
            start_date: allocation.start_date,
            end_date: allocation.end_date,
            allocated_hours: allocation.allocated_hours,
            status: allocation.status
          })
          .select();
            
        if (error) throw error;
        
        return data?.[0];
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      toast.success("Recurso alocado com sucesso");
      queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
    },
    onError: (error: any) => {
      console.error("Erro ao alocar recurso:", error);
      
      if (error.message?.includes("Membro da equipe já possui alocação neste período")) {
        toast.error("Este membro já possui uma alocação no período selecionado");
      } else {
        toast.error("Erro ao alocar recurso");
      }
    }
  });

  const deleteAllocation = useMutation({
    mutationFn: async (allocationId: string) => {
      try {
        setLoading(true);
        
        const { error } = await supabase
          .from('project_allocations')
          .delete()
          .eq('id', allocationId);
          
        if (error) throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      toast.success("Alocação removida com sucesso");
      queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
    },
    onError: (error) => {
      console.error("Erro ao remover alocação:", error);
      toast.error("Erro ao remover alocação");
    }
  });

  return {
    loading,
    createAllocation,
    deleteAllocation
  };
}
