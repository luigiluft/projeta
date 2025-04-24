import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/project";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectAttributeValueInput } from "./ProjectAttributeValueInput";
import { ProjectAttribute } from "@/types/database";

interface ProjectTaskSelectorProps {
  onTasksSelected: (tasks: Task[], attributeValues: Record<string, number>) => void;
}

export function ProjectTaskSelector({ onTasksSelected }: ProjectTaskSelectorProps) {
  const [projectName, setProjectName] = useState<string>("");
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [currentEpic, setCurrentEpic] = useState<string>("");
  const [attributeValues, setAttributeValues] = useState<Record<string, number>>({});

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

  const { data: projectAttributes = [] } = useQuery({
    queryKey: ['project_attributes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_attributes')
        .select('*');

      if (error) {
        toast.error('Erro ao carregar atributos do projeto');
        throw error;
      }

      return data;
    },
  });

  // Inicializar valores dos atributos
  useEffect(() => {
    if (projectAttributes.length > 0) {
      const initialValues: Record<string, number> = {};
      projectAttributes.forEach(attr => {
        const code = attr.code || attr.name;
        initialValues[code] = parseFloat(attr.default_value || '0');
      });
      setAttributeValues(initialValues);
    }
  }, [projectAttributes]);

  const epics = Array.from(new Set(fetchedTasks.map(task => task.epic))).filter(Boolean);
  
  const selectedTasks = fetchedTasks.filter(task => selectedEpics.includes(task.epic || ''));
  
  const totalHours = selectedTasks.reduce((sum, task) => {
    // Calcular horas com base na fórmula e valores dos atributos
    let hours = 0;
    if (task.hours_formula) {
      try {
        // Criar uma cópia da fórmula para substituição
        let formula = task.hours_formula;
        
        // Substituir nomes de atributos pelos valores
        Object.entries(attributeValues).forEach(([key, value]) => {
          const regex = new RegExp(`\\b${key}\\b`, 'g');
          formula = formula.replace(regex, value.toString());
        });
        
        // Avaliar a fórmula
        hours = eval(formula);
        if (isNaN(hours)) hours = 0;
      } catch (error) {
        console.error('Erro ao calcular fórmula:', task.hours_formula, error);
        hours = 0;
      }
    }
    return sum + hours;
  }, 0);

  const addEpic = () => {
    if (!currentEpic) {
      toast.error("Selecione um epic para adicionar");
      return;
    }
    
    if (selectedEpics.includes(currentEpic)) {
      toast.error("Este epic já foi adicionado");
      return;
    }
    
    setSelectedEpics([...selectedEpics, currentEpic]);
    setCurrentEpic("");
  };

  const removeEpic = (epic: string) => {
    setSelectedEpics(selectedEpics.filter(e => e !== epic));
  };

  const handleAttributeValueChange = (code: string, value: number) => {
    setAttributeValues(prev => ({
      ...prev,
      [code]: value
    }));
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      toast.error("Digite um nome para o projeto");
      return;
    }

    if (selectedEpics.length === 0) {
      toast.error("Selecione pelo menos um epic");
      return;
    }

    try {
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: projectName,
          project_name: projectName,
          epic: selectedEpics.join(', '),
          type: 'default',
          total_hours: totalHours,
          total_cost: 0, // Será calculado depois
          metadata: { attribute_values: attributeValues } // Salvar valores dos atributos
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      onTasksSelected(selectedTasks, attributeValues);
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
            <span>Total de Horas: {totalHours.toFixed(2)}h</span>
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
            <label className="text-sm font-medium">
              Epics do Projeto
            </label>
            <div className="flex gap-2">
              <Select value={currentEpic} onValueChange={setCurrentEpic}>
                <SelectTrigger className="flex-1">
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
              <Button onClick={addEpic} variant="outline">Adicionar</Button>
            </div>
            
            {selectedEpics.length > 0 && (
              <div className="mt-4 space-y-2 border p-3 rounded-md">
                <h4 className="text-sm font-medium">Epics Selecionados:</h4>
                <ul className="space-y-2">
                  {selectedEpics.map(epic => (
                    <li key={epic} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                      <span>{epic}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEpic(epic)}
                        className="h-8 w-8 p-0 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {projectAttributes.length > 0 && (
            <div className="space-y-4 mt-6">
              <h4 className="text-md font-medium">Atributos do Projeto</h4>
              <p className="text-sm text-gray-500">
                Defina os valores dos atributos que serão usados para calcular as horas das tarefas
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {projectAttributes.map(attr => (
                  <ProjectAttributeValueInput
                    key={attr.id}
                    attribute={{
                      id: attr.id,
                      name: attr.name,
                      code: attr.code,
                      unit: attr.unit || '',
                      description: attr.description || '',
                      default_value: attr.default_value || '',
                    }}
                    value={attributeValues[attr.code || attr.name] || 0}
                    onChange={(code, value) => handleAttributeValueChange(code, value)}
                  />
                ))}
              </div>
            </div>
          )}
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
