import { Project, Task } from "@/types/project";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjectCalculations } from "./useProjectCalculations";
import { format, addDays } from "date-fns";

export const useProjectMutations = () => {
  const queryClient = useQueryClient();
  const { calculateProjectCosts } = useProjectCalculations();

  // Função auxiliar para verificar disponibilidade de membros
  const findAvailableTeamMembers = async (
    role: string,
    startDate: string,
    endDate: string,
    totalHours: number
  ) => {
    try {
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('position', role)
        .eq('status', 'active');

      if (teamError) throw teamError;
      
      if (!teamMembers || teamMembers.length === 0) {
        console.log(`Nenhum membro da equipe encontrado com o cargo ${role}`);
        return [];
      }

      const availableMembers = [];

      for (const member of teamMembers) {
        const { data: existingAllocations, error: allocError } = await supabase
          .from('project_allocations')
          .select('allocated_hours')
          .eq('member_id', member.id)
          .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

        if (allocError) throw allocError;

        const totalAllocatedHours = existingAllocations?.reduce(
          (sum, alloc) => sum + (alloc.allocated_hours || 0), 
          0
        ) || 0;

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const dayDiff = Math.max(1, Math.round((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
        const workDays = Math.ceil(dayDiff * 5/7);
        const totalCapacity = workDays * member.daily_capacity;
        
        if (totalCapacity - totalAllocatedHours >= totalHours) {
          availableMembers.push({
            ...member,
            availableHours: totalCapacity - totalAllocatedHours
          });
        }
      }

      return availableMembers;
    } catch (error) {
      console.error("Erro ao buscar membros disponíveis:", error);
      throw error;
    }
  };

  // Função para criar um novo projeto
  const handleSubmit = async (selectedTasks: Task[], attributeValues: Record<string, number> = {}) => {
    if (selectedTasks.length === 0) {
      toast.error("Selecione pelo menos uma tarefa");
      return;
    }

    const epics = Array.from(new Set(selectedTasks.map(task => task.epic))).filter(Boolean);
    const epicNames = epics.join(', ');
    const costs = calculateProjectCosts(selectedTasks, attributeValues);
    
    // Agrupar tarefas por responsável para verificação de disponibilidade
    const roleGroups: Record<string, Task[]> = {};
    selectedTasks.forEach(task => {
      if (task.owner) {
        if (!roleGroups[task.owner]) {
          roleGroups[task.owner] = [];
        }
        roleGroups[task.owner].push(task);
      }
    });

    // Verificar disponibilidade antes de criar o projeto
    const today = new Date();
    const formattedToday = format(today, 'yyyy-MM-dd');
    const estimatedEndDate = format(addDays(today, 30), 'yyyy-MM-dd');

    try {
      // Verificar disponibilidade para cada cargo
      const availabilityChecks = await Promise.all(
        Object.entries(roleGroups).map(async ([role, tasks]) => {
          const totalHours = tasks.reduce((sum, task) => {
            return sum + (task.calculated_hours || task.fixed_hours || 0);
          }, 0);

          const availableMembers = await findAvailableTeamMembers(
            role,
            formattedToday,
            estimatedEndDate,
            totalHours
          );

          return {
            role,
            hasAvailable: availableMembers.length > 0,
            member: availableMembers[0],
            tasks,
            totalHours
          };
        })
      );

      const unavailableRoles = availabilityChecks.filter(check => !check.hasAvailable);
      if (unavailableRoles.length > 0) {
        toast.error(`Não há membros disponíveis para os cargos: ${unavailableRoles.map(r => r.role).join(', ')}`);
        return;
      }

      // 1. Criar o projeto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: epicNames,
          epic: epicNames,
          type: 'default',
          total_hours: costs.totalHours,
          base_cost: costs.baseCost,
          total_cost: costs.totalCost,
          profit_margin: costs.profitMargin,
          status: 'draft',
          currency: 'BRL',
          progress: 0,
          delay_days: 0,
          favorite: false,
          priority: 0,
          tags: [],
          archived: false,
          deleted: false,
          version: 1,
          metadata: { 
            attribute_values: attributeValues,
            implementation_tasks_count: selectedTasks.filter(t => !t.epic.toLowerCase().includes('sustentação')).length,
            sustainment_tasks_count: selectedTasks.filter(t => t.epic.toLowerCase().includes('sustentação')).length
          },
          attributes: attributeValues,
          settings: {},
          project_name: epicNames,
          start_date: formattedToday,
          expected_end_date: estimatedEndDate,
          due_date: estimatedEndDate,
        }])
        .select();

      if (projectError) throw projectError;
      
      if (projectData && projectData.length > 0) {
        const projectId = projectData[0].id;
        
        // 2. Criar as alocações e associar as tarefas
        for (const check of availabilityChecks) {
          if (check.member) {
            // Criar alocação para o membro
            const { error: allocError } = await supabase
              .from('project_allocations')
              .insert({
                project_id: projectId,
                member_id: check.member.id,
                allocated_hours: check.totalHours,
                start_date: formattedToday,
                end_date: estimatedEndDate,
                status: 'scheduled'
              });

            if (allocError) {
              console.error(`Erro ao alocar membro para ${check.role}:`, allocError);
              continue;
            }

            // Associar tarefas ao projeto
            const projectTasks = check.tasks.map(task => ({
              project_id: projectId,
              task_id: task.id,
              calculated_hours: task.calculated_hours || task.fixed_hours || 0,
              is_active: true,
              status: 'pending',
              start_date: formattedToday,
              end_date: estimatedEndDate,
              owner_id: check.member.id
            }));

            const { error: tasksError } = await supabase
              .from('project_tasks')
              .insert(projectTasks);

            if (tasksError) {
              console.error("Erro ao associar tarefas ao projeto:", tasksError);
              toast.error("Erro ao registrar tarefas do projeto");
            }
          }
        }

        toast.success("Projeto criado com sucesso e recursos alocados!");
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        return projectId;
      }
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast.error("Erro ao criar projeto e alocar recursos");
      throw error;
    }
  };

  // Função para excluir um projeto
  const handleDelete = async (projectId: string) => {
    try {
      // Primeiro excluir alocações relacionadas
      const { error: allocError } = await supabase
        .from('project_allocations')
        .delete()
        .eq('project_id', projectId);

      if (allocError) {
        console.error("Erro ao excluir alocações:", allocError);
      }

      // Depois marcar o projeto como excluído
      const { error } = await supabase
        .from('projects')
        .update({
          deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Projeto excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir projeto");
      console.error(error);
      throw error;
    }
  };

  return {
    handleSubmit,
    handleDelete
  };
};
