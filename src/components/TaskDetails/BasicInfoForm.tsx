
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CircleDollarSign } from "lucide-react";

interface BasicInfoFormProps {
  task: Task;
  onSubmit: (task: Task) => void;
  projectAttributes?: Record<string, any>;
}

export function BasicInfoForm({ task, onSubmit, projectAttributes }: BasicInfoFormProps) {
  const [hoursType, setHoursType] = useState<string>(task.hours_type || 'fixed');
  const [fixedHours, setFixedHours] = useState<number>(task.fixed_hours || 0);
  const [hoursFormula, setHoursFormula] = useState<string>(task.hours_formula || '');
  const [taskName, setTaskName] = useState<string>(task.task_name || '');
  const [phase, setPhase] = useState<string>(task.phase || '');
  const [epic, setEpic] = useState<string>(task.epic || '');
  const [story, setStory] = useState<string>(task.story || '');
  const [owner, setOwner] = useState<string>(task.owner || '');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>(task.status || 'pending');
  const [isActive, setIsActive] = useState<boolean>(task.is_active || false);
  const [isThirdPartyCost, setIsThirdPartyCost] = useState<boolean>(task.is_third_party_cost || false);
  const [costAmount, setCostAmount] = useState<number>(task.cost_amount || 0);

  // Atualizar estados quando a tarefa mudar
  useEffect(() => {
    setHoursType(task.hours_type || 'fixed');
    setFixedHours(task.fixed_hours || 0);
    setHoursFormula(task.hours_formula || '');
    setTaskName(task.task_name || '');
    setPhase(task.phase || '');
    setEpic(task.epic || '');
    setStory(task.story || '');
    setOwner(task.owner || '');
    setStatus(task.status || 'pending');
    setIsActive(task.is_active || false);
    setIsThirdPartyCost(task.is_third_party_cost || false);
    setCostAmount(task.cost_amount || 0);
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedTask: Task = {
      ...task,
      hours_type: hoursType,
      fixed_hours: hoursType === 'fixed' ? fixedHours : undefined,
      hours_formula: hoursType === 'formula' ? hoursFormula : undefined,
      task_name: taskName,
      phase,
      epic,
      story,
      owner,
      status,
      is_active: isActive,
      is_third_party_cost: isThirdPartyCost,
      cost_amount: isThirdPartyCost ? costAmount : undefined,
    };
    
    onSubmit(updatedTask);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-md border p-6">
      <h2 className="text-lg font-medium">Informações Básicas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task_name">Nome da Tarefa</Label>
          <Input 
            id="task_name" 
            value={taskName} 
            onChange={(e) => setTaskName(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="owner">Responsável</Label>
          <Input 
            id="owner" 
            value={owner} 
            onChange={(e) => setOwner(e.target.value)} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phase">Fase</Label>
          <Input 
            id="phase" 
            value={phase} 
            onChange={(e) => setPhase(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="epic">Epic</Label>
          <Input 
            id="epic" 
            value={epic} 
            onChange={(e) => setEpic(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="story">Story</Label>
          <Input 
            id="story" 
            value={story} 
            onChange={(e) => setStory(e.target.value)} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={status} 
            onValueChange={(value) => setStatus(value as 'pending' | 'in_progress' | 'completed')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2 h-full pt-8">
          <Switch 
            id="is_active" 
            checked={isActive} 
            onCheckedChange={setIsActive} 
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Tarefa Ativa
          </Label>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center space-x-2 mb-4">
          <Switch 
            id="is_third_party_cost" 
            checked={isThirdPartyCost} 
            onCheckedChange={setIsThirdPartyCost}
          />
          <Label htmlFor="is_third_party_cost" className="cursor-pointer">
            Custo com Terceiros
          </Label>
        </div>

        {isThirdPartyCost ? (
          <div className="space-y-2">
            <Label htmlFor="cost_amount">Valor do Custo (R$)</Label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="cost_amount" 
                type="number" 
                step="0.01"
                value={costAmount}
                onChange={(e) => setCostAmount(parseFloat(e.target.value))}
                className="pl-10"
                min="0"
              />
            </div>
            <p className="text-sm text-gray-500">
              Este valor será adicionado diretamente ao custo do projeto, sem contabilizar horas.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              <Label htmlFor="hours_type">Tipo de Estimativa</Label>
              <Select 
                value={hoursType} 
                onValueChange={setHoursType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de horas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Horas Fixas</SelectItem>
                  <SelectItem value="formula">Fórmula de Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hoursType === 'fixed' ? (
              <div className="space-y-2">
                <Label htmlFor="fixed_hours">Horas Fixas</Label>
                <Input 
                  id="fixed_hours" 
                  type="number" 
                  step="0.01"
                  value={fixedHours}
                  onChange={(e) => setFixedHours(parseFloat(e.target.value))}
                  min="0"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="hours_formula">Fórmula de Horas</Label>
                <Textarea 
                  id="hours_formula" 
                  value={hoursFormula}
                  onChange={(e) => setHoursFormula(e.target.value)}
                  placeholder="Ex: IF(SKU_COUNT > 1000, SKU_COUNT * 0.01, SKU_COUNT * 0.02)"
                  className="font-mono text-sm"
                  rows={3}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Salvar Alterações</Button>
      </div>
    </form>
  );
}
