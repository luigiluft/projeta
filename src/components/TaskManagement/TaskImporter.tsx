import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { importFromCSV } from '@/utils/csvImport';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TaskImporterProps {
  onSuccess: () => void;
  buttonLabel?: string;
}

type ImportMode = 'add_update' | 'replace';

export function TaskImporter({ onSuccess, buttonLabel = "Importar Planilha" }: TaskImporterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('add_update');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setError(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo CSV para importar");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await importFromCSV(selectedFile);
      
      if (data.length === 0) {
        throw new Error('Nenhuma tarefa encontrada no arquivo');
      }
      
      console.log('Tarefas a serem importadas:', data);
      
      const tasks = data.map(row => {
        if (!row['task_name']) {
          throw new Error('Campo "task_name" é obrigatório');
        }

        const task = {
          task_name: row['task_name'] || '',
          phase: row['Fase'] || row['fase'] || row['phase'] || '',
          epic: row['Epic'] || row['epic'] || '',
          story: row['Story'] || row['story'] || '',
          owner: row['Responsável'] || row['responsavel'] || row['owner'] || '',
          is_active: row['Ativo'] === true || row['Ativo'] === 'Sim' || row['is_active'] === true || true,
          status: convertStatus(row['Status'] || row['status'] || 'pending'),
          hours_type: determineHoursType(row),
          fixed_hours: null as number | null,
          hours_formula: null as string | null
        };

        if (row['Horas Fixas'] || row['horas_fixas'] || row['fixed_hours']) {
          const hoursValue = row['Horas Fixas'] || row['horas_fixas'] || row['fixed_hours'];
          const hours = parseFloat(String(hoursValue));
          if (!isNaN(hours)) {
            task.fixed_hours = hours;
          }
        }

        if (row['Fórmula de Horas'] || row['formula_horas'] || row['hours_formula']) {
          task.hours_formula = row['Fórmula de Horas'] || row['formula_horas'] || row['hours_formula'];
          task.hours_type = 'formula';
        }

        return task;
      });

      if (importMode === 'replace') {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) {
          console.error('Erro ao excluir tarefas existentes:', deleteError);
          throw new Error(`Erro ao excluir tarefas existentes: ${deleteError.message}`);
        }

        const { error: insertError } = await supabase.from('tasks').insert(tasks);

        if (insertError) {
          console.error('Erro ao importar tarefas:', insertError);
          throw new Error(`Erro ao importar tarefas: ${insertError.message}`);
        }

        toast.success(`${tasks.length} tarefas importadas com sucesso (modo substituição)!`);
      } else {
        const { data: existingTasks, error: fetchError } = await supabase
          .from('tasks')
          .select('*');

        if (fetchError) {
          console.error('Erro ao buscar tarefas existentes:', fetchError);
          throw new Error(`Erro ao buscar tarefas existentes: ${fetchError.message}`);
        }

        const tasksToInsert: typeof tasks = [];
        const tasksToUpdate: (typeof tasks[0] & { id: string })[] = [];

        tasks.forEach(importedTask => {
          const existingTask = existingTasks?.find(
            et => et.task_name === importedTask.task_name && 
                 et.epic === importedTask.epic && 
                 et.story === importedTask.story
          );

          if (existingTask) {
            tasksToUpdate.push({
              ...importedTask,
              id: existingTask.id
            });
          } else {
            tasksToInsert.push(importedTask);
          }
        });

        if (tasksToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('tasks')
            .insert(tasksToInsert);

          if (insertError) {
            console.error('Erro ao inserir novas tarefas:', insertError);
            throw new Error(`Erro ao inserir novas tarefas: ${insertError.message}`);
          }
        }

        for (const task of tasksToUpdate) {
          const { id, ...updateData } = task;
          const { error: updateError } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id);

          if (updateError) {
            console.error(`Erro ao atualizar tarefa ${id}:`, updateError);
            throw new Error(`Erro ao atualizar tarefa: ${updateError.message}`);
          }
        }

        toast.success(`Importação concluída: ${tasksToInsert.length} tarefas novas e ${tasksToUpdate.length} tarefas atualizadas!`);
      }

      onSuccess();
      setOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setError(`${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const determineHoursType = (row: Record<string, any>): string => {
    if (row['Fórmula de Horas'] || row['formula_horas'] || row['hours_formula']) {
      return 'formula';
    } else if (row['Horas Fixas'] || row['horas_fixas'] || row['fixed_hours']) {
      return 'fixed';
    }
    return 'fixed';
  };

  const convertStatus = (status: string): string => {
    status = (status || '').toLowerCase();
    if (status.includes('progre') || status.includes('andamento')) {
      return 'in_progress';
    } else if (status.includes('conclu') || status.includes('complet')) {
      return 'completed';
    }
    return 'pending';
  };

  const handleImportClick = () => {
    setOpen(true);
    setError(null);
  };

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setError(null);
    setImportMode('add_update');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleImportClick}
        className="flex items-center gap-2" 
      >
        <Upload className="h-4 w-4" />
        {buttonLabel}
      </Button>

      <Dialog open={open} onOpenChange={(openState) => {
        setOpen(openState);
        if (!openState) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Tarefas</DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV para importar tarefas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Formato esperado</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                O arquivo deve conter uma coluna chamada <strong>"Tarefa"</strong> (obrigatória) e pode conter colunas como: 
                Fase, Epic, Story, Responsável, Status, Horas Fixas, Fórmula de Horas.
              </AlertDescription>
            </Alert>
            
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="importMode">Modo de importação</Label>
                <Select value={importMode} onValueChange={(value) => setImportMode(value as ImportMode)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modo de importação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add_update">Adicionar e atualizar tarefas</SelectItem>
                    <SelectItem value="replace">Substituir todas as tarefas existentes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {importMode === 'add_update' 
                    ? 'Novas tarefas serão adicionadas e tarefas existentes serão atualizadas se tiverem o mesmo nome, epic e story.' 
                    : 'ATENÇÃO: Todas as tarefas existentes serão excluídas e substituídas pelas novas.'}
                </p>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <input
                  type="file"
                  id="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <Button 
                  onClick={handleSelectFileClick} 
                  disabled={loading}
                  className="w-full"
                >
                  {selectedFile ? selectedFile.name : 'Selecionar arquivo CSV'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={loading || !selectedFile}
              className="ml-2"
            >
              {loading ? 'Processando...' : 'Importar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
