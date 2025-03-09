
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { importFromCSV } from '@/utils/csvImport';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';

interface TaskImporterProps {
  onSuccess: () => void;
}

export function TaskImporter({ onSuccess }: TaskImporterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await importFromCSV(file);
      
      // Map the imported data to match the database schema
      const tasks = data.map(row => {
        // Convert display names back to database field names
        const task: Record<string, any> = {
          task_name: row['Tarefa'],
          phase: row['Fase'],
          epic: row['Epic'],
          story: row['Story'],
          owner: row['Responsável'],
          is_active: row['Ativo'] === true || row['Ativo'] === 'Sim',
          status: convertStatus(row['Status']),
          hours_type: 'fixed'
        };

        // Handle fixed_hours if present
        if (row['Horas Fixas']) {
          const hours = parseFloat(row['Horas Fixas']);
          if (!isNaN(hours)) {
            task.fixed_hours = hours;
          }
        }

        // Handle hours_formula if present
        if (row['Fórmula de Horas']) {
          task.hours_formula = row['Fórmula de Horas'];
          task.hours_type = 'formula';
        }

        return task;
      });

      if (tasks.length === 0) {
        toast.error('Nenhuma tarefa encontrada no arquivo');
        return;
      }

      // Insert tasks into the database
      const { data: result, error } = await supabase.from('tasks').insert(tasks);

      if (error) {
        console.error('Erro ao importar tarefas:', error);
        toast.error(`Erro ao importar tarefas: ${error.message}`);
      } else {
        toast.success(`${tasks.length} tarefas importadas com sucesso!`);
        onSuccess();
        setOpen(false);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Upload className="h-4 w-4" />
        Importar CSV
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Tarefas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione um arquivo CSV para importar tarefas. O arquivo deve seguir o formato exportado pela plataforma.
            </p>
            
            <div className="flex flex-col gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90"
              />
              
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold">Colunas esperadas:</p>
                <ul className="list-disc list-inside">
                  <li>Tarefa (obrigatório) - Nome da tarefa</li>
                  <li>Fase - Fase do projeto</li>
                  <li>Epic - Epic relacionado</li>
                  <li>Story - Story relacionada</li>
                  <li>Responsável - Responsável pela tarefa</li>
                  <li>Status - Status da tarefa (Pendente, Em Progresso, Concluído)</li>
                  <li>Fórmula de Horas - Fórmula para cálculo de horas</li>
                  <li>Horas Fixas - Quantidade fixa de horas</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} className="mr-2">
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
              >
                {loading ? 'Importando...' : 'Selecionar Arquivo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
