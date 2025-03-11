
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

  const checkAvailability = async (startDate: string, endDate: string, requiredHours: number = 0) => {
    setCheckingAvailability(true);
    try {
      const result = await getAvailability(startDate, endDate, requiredHours);
      return result;
    } finally {
      setCheckingAvailability(false);
    }
  };

  return {
    teamMembers: teamMembersQuery,
    projectTasks: projectTasksQuery,
    projectAllocations: projectAllocationsQuery,
    loading,
    checkingAvailability,
    getAvailability: checkAvailability,
    createAllocation,
    deleteAllocation
  };
}

export * from "./types";
