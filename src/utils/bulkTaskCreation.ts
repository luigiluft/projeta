
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskData {
  epic: string;
  story: string;
  task_name: string;
  formula: string;
  owner?: string;
  phase?: string;
}

export async function createTasksInBulk(tasks: TaskData[]) {
  try {
    const processedTasks = tasks.map(task => ({
      epic: task.epic,
      story: task.story,
      task_name: task.task_name,
      hours_formula: task.formula,
      owner: task.owner || 'PO',
      phase: task.phase || task.epic.split(' ')[0], // Se não fornecido, usa a primeira palavra do epic
      is_active: true,
      status: 'pending'
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(processedTasks)
      .select();

    if (error) {
      console.error('Erro ao cadastrar tarefas em lote:', error);
      toast.error(`Erro ao cadastrar tarefas: ${error.message}`);
      return { success: false, error };
    }

    toast.success(`${processedTasks.length} tarefas cadastradas com sucesso!`);
    return { success: true, data };
  } catch (err) {
    console.error('Erro ao processar cadastro em lote:', err);
    toast.error('Ocorreu um erro ao processar o cadastro em lote');
    return { success: false, error: err };
  }
}
