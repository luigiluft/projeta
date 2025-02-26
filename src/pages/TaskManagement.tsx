
import { TaskList } from "@/components/TaskManagement/TaskList";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { TaskHeader } from "@/components/TaskManagement/TaskHeader";
import { useTaskManagement } from "@/hooks/useTaskManagement";

export default function TaskManagement() {
  const {
    showForm,
    tasks,
    columns,
    savedViews,
    handleImportSpreadsheet,
    handleNewTask,
    handleColumnVisibilityChange,
    handleColumnsChange,
    handleSaveView,
    handleLoadView,
    handleTaskSubmit,
    setShowForm,
  } = useTaskManagement();

  return (
    <div className="h-full flex flex-col">
      <div className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="border-b">
          <div className="p-4">
            <TaskHeader
              columns={columns}
              savedViews={savedViews}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              onSaveView={handleSaveView}
              onLoadView={handleLoadView}
              onImportSpreadsheet={handleImportSpreadsheet}
              onNewTask={handleNewTask}
              tasks={tasks}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="h-full overflow-hidden rounded-lg bg-white shadow-sm">
          {showForm ? (
            <div className="p-6">
              <TaskForm 
                onSubmit={handleTaskSubmit}
                open={showForm}
                onOpenChange={setShowForm}
              />
            </div>
          ) : (
            <div className="h-full">
              <TaskList 
                tasks={tasks} 
                columns={columns}
                onColumnsChange={handleColumnsChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
