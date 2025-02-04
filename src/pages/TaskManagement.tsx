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
    <div className="container mx-auto py-6 space-y-6">
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

      {showForm ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskForm 
              onSubmit={handleTaskSubmit}
              open={showForm}
              onOpenChange={setShowForm}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TaskList 
              tasks={tasks} 
              columns={columns}
              onColumnsChange={handleColumnsChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}