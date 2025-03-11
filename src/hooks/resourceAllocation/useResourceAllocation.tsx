
import { useState } from "react";
import { useTeamMembers } from "./useTeamMembers";
import { useProjectTasks } from "./useProjectTasks";
import { useProjectAllocations } from "./useProjectAllocations";
import { useAllocationMutations } from "./useAllocationMutations";
import { getAvailability } from "./availabilityService";

export function useResourceAllocation(projectId?: string) {
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const teamMembersQuery = useTeamMembers();
  
  const projectTasksQuery = useProjectTasks(projectId);
  
  const projectAllocationsQuery = useProjectAllocations(projectId);

  const {
    loading,
    createAllocation,
    deleteAllocation
  } = useAllocationMutations();

  return {
    teamMembers: teamMembersQuery,
    projectTasks: projectTasksQuery,
    projectAllocations: projectAllocationsQuery,
    loading,
    checkingAvailability,
    getAvailability,
    createAllocation,
    deleteAllocation
  };
}

export * from "./types";
