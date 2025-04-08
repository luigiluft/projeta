
import { Task } from "@/types/project";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TaskItem } from "./TaskItem";

interface StoryGroupProps {
  phase: string;
  epic: string;
  story: string;
  tasks: Task[];
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  selectedTasks?: string[];
}

export function StoryGroup({
  phase,
  epic,
  story,
  tasks,
  expanded,
  toggleExpand,
  onTaskSelect,
  selectedTasks = []
}: StoryGroupProps) {
  const storyId = `story-${phase}-${epic}-${story}`;
  const isExpanded = expanded[storyId];

  return (
    <div className="border border-gray-100 rounded">
      <div 
        className="flex items-center p-2 bg-gray-50/30 cursor-pointer"
        onClick={() => toggleExpand(storyId)}
      >
        <div className="mr-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="font-medium">{story}</div>
        <div className="ml-2 text-sm text-gray-500">
          ({tasks.length} tarefas)
        </div>
      </div>

      {isExpanded && (
        <div className="pl-6 pr-2 py-2">
          {/* Lista de Tarefas */}
          <div className="space-y-1">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskSelect={onTaskSelect}
                isSelected={selectedTasks.includes(task.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
