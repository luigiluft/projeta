
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamAllocation } from "@/types/project";

export const useAllocationData = (isNewProject: boolean, taskProjectId?: string) => {
  const [allocations, setAllocations] = useState<TeamAllocation[]>([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);

  useEffect(() => {
    // Para projetos novos, não precisamos buscar alocações existentes
    // Mas para projetos existentes, continuamos buscando as alocações
    if (taskProjectId && !isNewProject) {
      fetchAllocations(taskProjectId);
    } else if (isNewProject) {
      // Para projetos novos, buscamos alocações gerais da equipe
      // para mostrar a disponibilidade atual
      fetchTeamAllocations();
    }
  }, [taskProjectId, isNewProject]);

  const fetchTeamAllocations = async () => {
    try {
      setLoadingAllocations(true);
      
      // Buscar todas as alocações ativas para mostrar disponibilidade
      const { data: allocationData, error: allocationError } = await supabase
        .from('project_allocations')
        .select(`
          id,
          project_id,
          member_id,
          task_id,
          start_date,
          end_date,
          allocated_hours,
          status,
          tasks:task_id(task_name),
          team_members:member_id(first_name, last_name)
        `)
        .in('status', ['scheduled', 'in_progress']);

      if (allocationError) {
        console.error("Erro ao buscar alocações gerais:", allocationError);
        return;
      }

      // Formatar os dados de alocação
      const formattedAllocations = allocationData.map(alloc => ({
        id: alloc.id,
        member_id: alloc.member_id,
        member_name: `${alloc.team_members.first_name} ${alloc.team_members.last_name}`,
        project_id: alloc.project_id,
        task_id: alloc.task_id,
        task_name: alloc.tasks?.task_name || "Sem tarefa",
        start_date: alloc.start_date,
        end_date: alloc.end_date,
        allocated_hours: alloc.allocated_hours,
        status: alloc.status
      }));

      console.log("Alocações gerais encontradas:", formattedAllocations.length);
      setAllocations(formattedAllocations);
    } catch (error) {
      console.error("Erro ao carregar alocações gerais:", error);
    } finally {
      setLoadingAllocations(false);
    }
  };

  const fetchAllocations = async (projectId: string) => {
    try {
      setLoadingAllocations(true);
      
      // Buscar alocações para este projeto
      const { data: allocationData, error: allocationError } = await supabase
        .from('project_allocations')
        .select(`
          id,
          project_id,
          member_id,
          task_id,
          start_date,
          end_date,
          allocated_hours,
          status,
          tasks:task_id(task_name),
          team_members:member_id(first_name, last_name)
        `)
        .eq('project_id', projectId);

      if (allocationError) {
        console.error("Erro ao buscar alocações:", allocationError);
        return;
      }

      // Formatar os dados de alocação
      const formattedAllocations = allocationData.map(alloc => ({
        id: alloc.id,
        member_id: alloc.member_id,
        member_name: `${alloc.team_members.first_name} ${alloc.team_members.last_name}`,
        project_id: alloc.project_id,
        task_id: alloc.task_id,
        task_name: alloc.tasks?.task_name || "Sem tarefa",
        start_date: alloc.start_date,
        end_date: alloc.end_date,
        allocated_hours: alloc.allocated_hours,
        status: alloc.status
      }));

      setAllocations(formattedAllocations);
    } catch (error) {
      console.error("Erro ao carregar alocações:", error);
    } finally {
      setLoadingAllocations(false);
    }
  };

  return {
    allocations,
    loadingAllocations
  };
};
