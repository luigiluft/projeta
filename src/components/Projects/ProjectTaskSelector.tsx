
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/project";
import { TaskList } from "@/components/TaskManagement/TaskList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface ProjectTaskSelectorProps {
  onTasksSelected: (tasks: Task[]) => void;
}

export function ProjectTaskSelector({ onTasksSelected }: ProjectTaskSelectorProps) {
  const [selectedEpic, setSelectedEpic] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar tarefas');
        throw error;
      }

      return data as Task[];
    },
  });

  const epics = Array.from(new Set(tasks.map(task => task.epic))).filter(Boolean);
  const selectedTasks = tasks.filter(task => task.epic === selectedEpic);
  const totalHours = selectedTasks.reduce((sum, task) => sum + (task.hours || 0), 0);

  const handleSubmit = () => {
    if (!selectedEpic) {
      toast.error("Selecione um epic");
      return;
    }

    if (!projectName.trim()) {
      toast.error("Digite um nome para o projeto");
      return;
    }

    onTasksSelected(selectedTasks);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Novo Projeto</h3>
            <p className="text-sm text-gray-500">
              Preencha os dados do projeto
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />
            <span>Total de Horas: {totalHours}h</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="projectName" className="text-sm font-medium">
              Nome do Projeto
            </label>
            <Input
              id="projectName"
              placeholder="Digite o nome do projeto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="epic" className="text-sm font-medium">
              Epic
            </label>
            <Select value={selectedEpic} onValueChange={setSelectedEpic}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Selecione um epic" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectLabel>Epics Disponíveis</SelectLabel>
                  {epics.map((epic) => (
                    <SelectItem key={epic} value={epic || ""}>
                      {epic}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedEpic && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Tarefas do Epic</h3>
          </div>
          <TaskList
            tasks={selectedTasks}
            columns={[
              { id: "task_name", label: "Tarefa", visible: true },
              { id: "phase", label: "Fase", visible: true },
              { id: "story", label: "Story", visible: true },
              { id: "hours", label: "Horas", visible: true },
            ]}
            onColumnsChange={() => {}}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button onClick={handleSubmit}>
          Criar Projeto
        </Button>
      </div>
    </div>
  );
}
