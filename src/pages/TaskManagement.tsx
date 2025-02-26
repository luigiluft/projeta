
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
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex-none p-6">
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

      <div className="flex-1 overflow-hidden px-6 pb-6">
        {showForm ? (
          <div className="h-full overflow-auto rounded-lg bg-white shadow">
            <div className="p-6">
              <TaskForm 
                onSubmit={handleTaskSubmit}
                open={showForm}
                onOpenChange={setShowForm}
              />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto rounded-lg bg-white shadow">
            <TaskList 
              tasks={tasks} 
              columns={columns}
              onColumnsChange={handleColumnsChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
