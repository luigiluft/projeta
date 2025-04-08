
import { useState } from "react";
import { Task } from "@/types/project";
import { ChevronDown, ChevronRight } from "lucide-react";
import { EpicGroup } from "./EpicGroup";

interface PhaseGroupProps {
  phase: string;
  epicMap: Record<string, { 
    epic: string, 
    storyMap: Record<string, { 
      story: string, 
      tasks: Task[] 
    }> 
  }>;
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  selectedTasks?: string[];
}

export function PhaseGroup({
  phase,
  epicMap,
  expanded,
  toggleExpand,
  onTaskSelect,
  selectedTasks = []
}: PhaseGroupProps) {
  const phaseId = `phase-${phase}`;
  const isExpanded = expanded[phaseId];

  return (
    <div className="border border-gray-100 rounded-md">
      <div 
        className="flex items-center p-3 bg-gray-50 cursor-pointer"
        onClick={() => toggleExpand(phaseId)}
      >
        <div className="mr-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="font-medium">{phase}</div>
        <div className="ml-2 text-sm text-gray-500">
          ({Object.keys(epicMap).length} epics)
        </div>
      </div>
      
      {isExpanded && (
        <div className="pl-6 pr-2 py-2 space-y-2">
          {/* Nível de Epic */}
          {Object.entries(epicMap).map(([epic, { storyMap }]) => (
            <EpicGroup
              key={`${phase}-${epic}`}
              phase={phase}
              epic={epic}
              storyMap={storyMap}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onTaskSelect={onTaskSelect}
              selectedTasks={selectedTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
