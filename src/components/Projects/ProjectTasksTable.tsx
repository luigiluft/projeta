
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Calendar, Edit, Check, X } from "lucide-react";
import { Task } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/TaskManagement/TaskForm";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { EmptyTasks } from "./TaskTabs/EmptyTasks";

interface ProjectTasksTableProps {
  tasks?: Task[];
  projectId: string;
  epic: string;
}

export function ProjectTasksTable({ tasks = [], projectId, epic }: ProjectTasksTableProps) {
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    taskId: string;
    field: 'start_date' | 'end_date' | null;
    projectTaskId: string;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      // Primeiro, criar a tarefa na tabela tasks
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          ...values,
          epic,
          is_active: true,
          status: 'pending',
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      if (taskData) {
        // Depois, relacionar a tarefa ao projeto na tabela project_tasks
        const { error: projectTaskError } = await supabase
          .from('project_tasks')
          .insert([{
            project_id: projectId,
            task_id: taskData.id,
            status: 'pending',
            is_active: true,
            calculated_hours: values.fixed_hours || 0,
            owner_id: user?.email // Usando email como owner_id já que agora é TEXT
          }]);

        if (projectTaskError) throw projectTaskError;
      }

      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      toast.success('Tarefa criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200",
    };

    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    try {
      return format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", date, e);
      return "-";
    }
  };

  const getHoursFromFormula = (formula: string | undefined) => {
    if (!formula) return 0;
    const hours = parseFloat(formula);
    return isNaN(hours) ? 0 : hours;
  };

  const handleEditDate = (
    taskId: string, 
    field: 'start_date' | 'end_date', 
    projectTaskId: string, 
    currentDate?: string
  ) => {
    setEditingTask({ 
      taskId,
      field,
      projectTaskId
    });
    
    if (currentDate) {
      try {
        setSelectedDate(parseISO(currentDate));
      } catch (e) {
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  };

  const handleSaveDate = async () => {
    if (!editingTask || !editingTask.projectTaskId) return;

    try {
      const { field, projectTaskId } = editingTask;
      
      const updateData = {
        [field]: selectedDate ? selectedDate.toISOString() : null
      };

      const { error } = await supabase
        .from('project_tasks')
        .update(updateData)
        .eq('id', projectTaskId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Data ${field === 'start_date' ? 'início' : 'término'} atualizada`);
      setEditingTask(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
      toast.error('Erro ao atualizar data');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setSelectedDate(null);
  };

  return (
    <div className="bg-muted/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Tarefas do Projeto</h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-3 w-3 mr-2" />
              Adicionar Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <TaskForm onSubmit={handleSubmit} open={open} onOpenChange={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
      
      {tasks.length === 0 ? (
        <EmptyTasks message="Nenhuma tarefa adicionada ao projeto" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fase</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data Início</TableHead>
              <TableHead>Data Fim</TableHead>
              <TableHead className="text-right">Horas Prev.</TableHead>
              <TableHead className="text-right">Horas Real.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div>{task.task_name}</div>
                    <div className="text-sm text-muted-foreground">{task.story}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {task.phase}
                  </Badge>
                </TableCell>
                <TableCell>{task.owner}</TableCell>
                <TableCell>
                  {editingTask?.taskId === task.id && editingTask.field === 'start_date' ? (
                    <div className="flex flex-col gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-[130px] justify-start text-left font-normal">
                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Selecionar"}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate || undefined}
                            onSelect={(date) => setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleSaveDate}>
                          <Check className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => handleEditDate(
                          task.id, 
                          'start_date', 
                          task.project_task_id || '', 
                          task.start_date
                        )}
                      >
                        <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                        {formatDate(task.start_date)}
                        <Edit className="h-3 w-3 text-gray-400 ml-1" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingTask?.taskId === task.id && editingTask.field === 'end_date' ? (
                    <div className="flex flex-col gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-[130px] justify-start text-left font-normal">
                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Selecionar"}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate || undefined}
                            onSelect={(date) => setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleSaveDate}>
                          <Check className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => handleEditDate(
                          task.id, 
                          'end_date', 
                          task.project_task_id || '', 
                          task.end_date
                        )}
                      >
                        <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                        {formatDate(task.end_date)}
                        <Edit className="h-3 w-3 text-gray-400 ml-1" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {getHoursFromFormula(task.hours_formula)}h
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {getHoursFromFormula(task.hours_formula)}h
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
