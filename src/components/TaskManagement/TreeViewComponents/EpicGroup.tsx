
import { Task } from "@/types/project";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StoryGroup } from "./StoryGroup";

interface EpicGroupProps {
  phase: string;
  epic: string;
  storyMap: Record<string, { 
    story: string, 
    tasks: Task[] 
  }>;
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  selectedTasks?: string[];
}

export function EpicGroup({
  phase,
  epic,
  storyMap,
  expanded,
  toggleExpand,
  onTaskSelect,
  selectedTasks = []
}: EpicGroupProps) {
  const epicId = `epic-${phase}-${epic}`;
  const isExpanded = expanded[epicId];

  return (
    <div className="border border-gray-100 rounded">
      <div 
        className="flex items-center p-2 bg-gray-50/50 cursor-pointer"
        onClick={() => toggleExpand(epicId)}
      >
        <div className="mr-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="font-medium">{epic}</div>
        <div className="ml-2 text-sm text-gray-500">
          ({Object.keys(storyMap).length} stories)
        </div>
      </div>

      {isExpanded && (
        <div className="pl-6 pr-2 py-2 space-y-2">
          {/* Nível de Story */}
          {Object.entries(storyMap).map(([story, { tasks: storyTasks }]) => (
            <StoryGroup
              key={`${phase}-${epic}-${story}`}
              phase={phase}
              epic={epic}
              story={story}
              tasks={storyTasks}
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
