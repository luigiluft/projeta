
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
    <div className="h-screen flex flex-col">
      <div className="sticky top-0 z-10 bg-background p-6 border-b">
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

      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow overflow-hidden">
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
