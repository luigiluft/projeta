
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

  console.log('TaskManagement - tasks:', tasks); // Debug log

  return (
    <div className="container mx-auto py-6">
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

      {showForm && (
        <TaskForm 
          onSubmit={handleTaskSubmit}
          open={showForm}
          onOpenChange={setShowForm}
        />
      )}

      {!showForm && tasks && tasks.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow">
          <TaskList 
            tasks={tasks} 
            columns={columns}
            onColumnsChange={handleColumnsChange}
          />
        </div>
      )}

      {!showForm && (!tasks || tasks.length === 0) && (
        <div className="mt-6 bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Nenhuma tarefa encontrada
        </div>
      )}
    </div>
  );
}
