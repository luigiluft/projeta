
import { Project, Column } from "@/types/project";
import { ProjectTasksTable } from "./ProjectTasksTable";
import { DraggableTable } from "@/components/ui/draggable-table";

interface ProjectsTableProps {
  projects: Project[];
  expandedProject: string | null;
  onToggleProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  formatCurrency: (value: number) => string;
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export function ProjectsTable({
  projects,
  expandedProject,
  onToggleProject,
  onEditProject,
  onDeleteProject,
  formatCurrency,
  columns,
  onColumnsChange,
}: ProjectsTableProps) {
  
  const formatValue = (value: any, columnId: string, rowData?: Project) => {
    if (!rowData) return '';
    
    if (columnId === 'name') {
      return (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onToggleProject(rowData.id)}>
          <div className="space-y-1">
            <div>{rowData.name}</div>
            {rowData.delay_days > 0 && (
              <div className="text-sm text-red-600">
                Atrasado: {rowData.delay_days} dias
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (columnId === 'status') {
      const statusColors: Record<string, string> = {
        draft: "bg-gray-100 text-gray-700 border-gray-200",
        in_progress: "bg-blue-50 text-blue-700 border-blue-200",
        completed: "bg-green-50 text-green-700 border-green-200",
        cancelled: "bg-red-50 text-red-700 border-red-200",
      };
      
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[rowData.status] || statusColors.draft}`}>
          {rowData.status}
        </span>
      );
    }
    
    if (columnId === 'type') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {rowData.type}
        </span>
      );
    }
    
    if (columnId === 'progress') {
      return (
        <div className="text-right">{Math.round(rowData.progress * 100)}%</div>
      );
    }
    
    if (columnId === 'total_hours') {
      return (
        <div className="text-right">{rowData.total_hours.toFixed(1)}h</div>
      );
    }
    
    if (columnId === 'total_cost') {
      return (
        <div className="text-right">{formatCurrency(rowData.total_cost)}</div>
      );
    }
    
    if (columnId === 'actions') {
      return (
        <div className="flex items-center justify-end gap-2">
          <button onClick={(e) => {
            e.stopPropagation();
            onEditProject(rowData.id);
          }} className="p-1 hover:bg-gray-100 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button onClick={(e) => {
            e.stopPropagation();
            onDeleteProject(rowData.id);
          }} className="p-1 hover:bg-gray-100 rounded text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      );
    }
    
    return value;
  };
  
  console.log("ProjectsTable received columns:", columns.map(c => `${c.id} (${c.visible ? 'visible' : 'hidden'})`));

  return (
    <div className="rounded-lg border bg-card">
      <DraggableTable
        columns={columns}
        onColumnsChange={onColumnsChange}
        data={projects}
        formatValue={formatValue}
      />
      
      {expandedProject && (
        <div className="border-t p-4">
          <ProjectTasksTable
            tasks={projects.find(p => p.id === expandedProject)?.tasks || []}
            projectId={expandedProject}
            epic={projects.find(p => p.id === expandedProject)?.epic || ""}
          />
        </div>
      )}
      
      {projects.length === 0 && (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Nenhum projeto cadastrado
        </div>
      )}
    </div>
  );
}
