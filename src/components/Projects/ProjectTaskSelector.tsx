
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/project";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface ProjectTaskSelectorProps {
  onTasksSelected: (tasks: Task[]) => void;
}

export function ProjectTaskSelector({ onTasksSelected }: ProjectTaskSelectorProps) {
  const [selectedEpic, setSelectedEpic] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");

  const { data: fetchedTasks = [] } = useQuery({
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

      // Transformar os dados para incluir order_number
      return data.map((task, index) => ({
        ...task,
        order_number: index + 1, // Adiciona order_number com base no índice
        phase: task.phase || '',
        epic: task.epic || '',
        story: task.story || '',
        owner: task.owner || '',
        status: (task.status as 'pending' | 'in_progress' | 'completed') || 'pending',
        is_active: task.is_active !== undefined ? task.is_active : true,
      })) as Task[];
    },
  });

  const epics = Array.from(new Set(fetchedTasks.map(task => task.epic))).filter(Boolean);
  const selectedTasks = fetchedTasks.filter(task => task.epic === selectedEpic);
  const totalHours = selectedTasks.reduce((sum, task) => {
    const hours = task.hours_formula ? parseFloat(task.hours_formula) : 0;
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      toast.error("Digite um nome para o projeto");
      return;
    }

    if (!selectedEpic) {
      toast.error("Selecione um epic");
      return;
    }

    try {
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: projectName,
          project_name: projectName,
          epic: selectedEpic,
          type: 'default',
          total_hours: totalHours,
          total_cost: 0, // Será calculado depois
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      onTasksSelected(selectedTasks);
      toast.success("Projeto criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar projeto");
      console.error(error);
    }
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
          <div className="space-y-2">
            <label htmlFor="projectName" className="text-sm font-medium">
              Nome do Projeto
            </label>
            <Input
              id="projectName"
              placeholder="Digite o nome do projeto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="epic" className="text-sm font-medium">
              Epic
            </label>
            <Select value={selectedEpic} onValueChange={setSelectedEpic}>
              <SelectTrigger id="epic">
                <SelectValue placeholder="Selecione um epic" />
              </SelectTrigger>
              <SelectContent>
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

      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
          Criar Projeto
        </Button>
      </div>
    </div>
  );
}
