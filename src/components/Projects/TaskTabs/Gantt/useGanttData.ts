
import { useState, useEffect } from "react";
import { Task } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isValid, addDays } from "date-fns";

interface TeamAllocation {
  id: string;
  member_id: string;
  member_name: string;
  project_id: string;
  task_id: string;
  task_name: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  status: string;
}

export function useGanttData(tasks: Task[]) {
  const [allocations, setAllocations] = useState<TeamAllocation[]>([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [minDate, setMinDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>(new Date());

  // Fetch allocations based on project_id
  useEffect(() => {
    if (tasks.length > 0 && tasks[0].project_task_id) {
      // First, get the project_id using the project_task_id
      const fetchProjectId = async () => {
        const { data: projectTaskData, error: projectTaskError } = await supabase
          .from('project_tasks')
          .select('project_id')
          .eq('id', tasks[0].project_task_id)
          .single();

        if (projectTaskError) {
          console.error("Erro ao buscar project_id:", projectTaskError);
          return;
        }

        if (projectTaskData?.project_id) {
          fetchAllocations(projectTaskData.project_id);
        }
      };

      fetchProjectId();
    }
  }, [tasks]);

  // Calculate min and max dates based on tasks and allocations
  useEffect(() => {
    // Filter implementation tasks
    const implementationTasks = tasks.filter(task => 
      !task.epic.toLowerCase().includes('sustentação') &&
      !task.epic.toLowerCase().includes('sustentacao')
    );

    // Sort tasks by start date
    const sortedTasks = [...implementationTasks].sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return dateA - dateB;
    });

    // Initialize min and max dates
    let min = new Date();
    let max = new Date();

    if (sortedTasks.length > 0) {
      // Initialize with the first task
      const firstTaskStart = sortedTasks[0].start_date 
        ? new Date(sortedTasks[0].start_date) 
        : new Date();
      
      min = firstTaskStart;
      max = firstTaskStart;

      // Find min and max among all tasks
      sortedTasks.forEach(task => {
        if (task.start_date) {
          const startDate = new Date(task.start_date);
          if (isValid(startDate) && startDate < min) {
            min = startDate;
          }
        }

        if (task.end_date) {
          const endDate = new Date(task.end_date);
          if (isValid(endDate) && endDate > max) {
            max = endDate;
          }
        }
      });

      // Add a day buffer at the beginning and end for better visualization
      min = addDays(min, -1);
      max = addDays(max, 1);
    }

    // Consider allocation dates for min/max if available
    if (allocations.length > 0) {
      allocations.forEach(allocation => {
        const allocStart = new Date(allocation.start_date);
        const allocEnd = new Date(allocation.end_date);
        
        if (isValid(allocStart) && allocStart < min) {
          min = allocStart;
        }
        
        if (isValid(allocEnd) && allocEnd > max) {
          max = allocEnd;
        }
      });
    }

    setMinDate(min);
    setMaxDate(max);

    // Create an array with all dates between min and max
    const range: Date[] = [];
    let currentDate = new Date(min);
    while (currentDate <= max) {
      range.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    setDateRange(range);
  }, [tasks, allocations]);

  const fetchAllocations = async (projectId: string) => {
    try {
      setLoadingAllocations(true);
      
      // Fetch allocations for this project
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

      // Format allocation data
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

  // Calculate X axis ticks from date range
  const xAxisTicks = dateRange.map(date => date.getTime());

  return {
    allocations,
    loadingAllocations,
    minDate,
    maxDate,
    xAxisTicks
  };
}
