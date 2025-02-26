
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="w-full flex-none bg-background border-b">
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

      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full rounded-lg bg-white shadow-sm">
          {showForm ? (
            <div className="p-6">
              <TaskForm 
                onSubmit={handleTaskSubmit}
                open={showForm}
                onOpenChange={setShowForm}
              />
            </div>
          ) : (
            <TaskList 
              tasks={tasks} 
              columns={columns}
              onColumnsChange={handleColumnsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
