
import { useState } from "react";
import { useTeamMembers } from "./useTeamMembers";
import { useProjectTasks } from "./useProjectTasks";
import { useProjectAllocations } from "./useProjectAllocations";
import { useAllocationMutations } from "./useAllocationMutations";
import { getAvailability } from "./availabilityService";

export function useResourceAllocation(projectId?: string) {
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const { 
    data: teamMembers = [], 
    isLoading: teamMembersLoading 
  } = useTeamMembers();
  
  const { 
    data: projectTasks = [], 
    isLoading: projectTasksLoading 
  } = useProjectTasks(projectId);
  
  const { 
    data: projectAllocations = [], 
    isLoading: allocationsLoading 
  } = useProjectAllocations(projectId);

  const {
    loading,
    createAllocation,
    deleteAllocation
  } = useAllocationMutations();

  return {
    teamMembers,
    projectAllocations,
    projectTasks,
    loading,
    teamMembersLoading,
    projectTasksLoading,
    allocationsLoading,
    checkingAvailability,
    getAvailability,
    createAllocation: createAllocation.mutate,
    deleteAllocation: deleteAllocation.mutate
  };
}

export * from "./types";
